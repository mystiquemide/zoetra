// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Zoetra Heartbeat SLA Registry
/// @notice Devices prove liveness with on-chain heartbeats. Uptime is scored over a
///         rolling window computed entirely from stored counters and block.timestamp,
///         so the score reflects reality even between transactions. Operators stake
///         native BOT against a declared SLA; anyone can slash a device whose score
///         has fallen below its own threshold, and is paid a bounty for doing so.
contract ZoetraRegistry {
    struct Device {
        address operator;
        uint128 stake;
        uint64 registeredAt;
        uint64 windowStart; // start of the current scoring bucket
        uint64 lastBeat;
        uint64 deregisteredAt; // 0 while active
        uint64 lastSlashAt;
        uint32 intervalSec; // declared heartbeat cadence
        uint32 beatsCurr; // beats recorded in the current bucket
        uint32 beatsPrev; // beats recorded in the immediately preceding bucket
        uint16 slaBps; // SLA threshold, basis points (e.g. 9000 = 90%)
        string name;
    }

    uint256 public constant WINDOW_BEATS = 20; // beats expected per full bucket at ideal cadence
    uint256 public constant MIN_STAKE = 0.05 ether;
    uint256 public constant MIN_INTERVAL = 5;
    uint256 public constant MAX_INTERVAL = 300;
    uint256 public constant MIN_SLA_BPS = 5000;
    uint256 public constant MAX_SLA_BPS = 9999;
    uint256 public constant SLASH_BPS = 2000; // 20% of remaining stake per slash
    uint256 public constant BOUNTY_BPS = 1000; // 10% of the slashed amount, paid to caller
    uint256 public constant WITHDRAW_COOLDOWN = 60;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    uint256 public deviceCount;
    mapping(uint256 => Device) public devices;

    event Registered(uint256 indexed id, address indexed operator, string name, uint32 intervalSec, uint16 slaBps, uint256 stake);
    event Beat(uint256 indexed id, uint256 timestamp, uint16 score);
    event Slashed(uint256 indexed id, address indexed caller, uint256 amount, uint256 bounty, uint16 score);
    event Deregistered(uint256 indexed id, uint256 timestamp);
    event Withdrawn(uint256 indexed id, address indexed operator, uint256 amount);

    error InsufficientStake();
    error BadInterval();
    error BadSla();
    error NotOperator();
    error NotActive();
    error UnknownDevice();
    error ScoreAboveThreshold();
    error SlashCooldown();
    error StillActive();
    error CooldownNotElapsed();
    error TransferFailed();

    modifier deviceExists(uint256 id) {
        if (devices[id].operator == address(0)) revert UnknownDevice();
        _;
    }

    /// @notice Register a device, staking native BOT against a self-declared SLA.
    function register(string calldata name, uint32 intervalSec, uint16 slaBps) external payable returns (uint256 id) {
        if (msg.value < MIN_STAKE) revert InsufficientStake();
        if (intervalSec < MIN_INTERVAL || intervalSec > MAX_INTERVAL) revert BadInterval();
        if (slaBps < MIN_SLA_BPS || slaBps > MAX_SLA_BPS) revert BadSla();

        id = ++deviceCount;
        devices[id] = Device({
            operator: msg.sender,
            stake: uint128(msg.value),
            registeredAt: uint64(block.timestamp),
            windowStart: uint64(block.timestamp),
            lastBeat: 0,
            deregisteredAt: 0,
            lastSlashAt: 0,
            intervalSec: intervalSec,
            beatsCurr: 0,
            beatsPrev: 0,
            slaBps: slaBps,
            name: name
        });

        emit Registered(id, msg.sender, name, intervalSec, slaBps, msg.value);
    }

    /// @notice Record a heartbeat for a device. Only the registered operator wallet may call.
    function heartbeat(uint256 id) external deviceExists(id) {
        Device storage d = devices[id];
        if (msg.sender != d.operator) revert NotOperator();
        if (d.deregisteredAt != 0) revert NotActive();

        _roll(d);
        d.beatsCurr += 1;
        d.lastBeat = uint64(block.timestamp);

        emit Beat(id, block.timestamp, scoreOf(id));
    }

    /// @notice Current uptime score in basis points (0-10000), computed live from
    ///         stored counters and block.timestamp. Never requires a transaction to update.
    function scoreOf(uint256 id) public view returns (uint16) {
        Device storage d = devices[id];
        if (d.operator == address(0)) return 0;

        uint256 interval = d.intervalSec;
        uint256 L = interval * WINDOW_BEATS;
        uint256 elapsed = block.timestamp - d.windowStart;
        bool hasPrevBucket = d.windowStart > d.registeredAt;

        uint256 received;
        uint256 expected;

        if (elapsed < L) {
            received = uint256(d.beatsPrev) + uint256(d.beatsCurr);
            expected = (hasPrevBucket ? WINDOW_BEATS : 0) + (elapsed / interval);
        } else if (elapsed < 2 * L) {
            received = uint256(d.beatsCurr);
            expected = WINDOW_BEATS + ((elapsed - L) / interval);
        } else {
            received = 0;
            uint256 elapsedInCurr = elapsed - ((elapsed / L) * L);
            expected = WINDOW_BEATS + (elapsedInCurr / interval);
        }

        if (expected == 0) return 10000;
        uint256 bps = (received * 10000) / expected;
        return bps > 10000 ? 10000 : uint16(bps);
    }

    /// @notice Slash a device whose score has fallen below its declared SLA. Permissionless;
    ///         the caller earns a bounty carved out of the slashed stake.
    function slash(uint256 id) external deviceExists(id) {
        Device storage d = devices[id];
        if (d.deregisteredAt != 0) revert NotActive();

        uint256 L = uint256(d.intervalSec) * WINDOW_BEATS;
        if (block.timestamp - d.lastSlashAt < L) revert SlashCooldown();

        uint16 score = scoreOf(id);
        if (score >= d.slaBps) revert ScoreAboveThreshold();

        uint256 amount = (uint256(d.stake) * SLASH_BPS) / 10000;
        uint256 bounty = (amount * BOUNTY_BPS) / 10000;
        uint256 burned = amount - bounty;

        d.stake -= uint128(amount);
        d.lastSlashAt = uint64(block.timestamp);

        emit Slashed(id, msg.sender, amount, bounty, score);

        _send(msg.sender, bounty);
        _send(BURN_ADDRESS, burned);
    }

    /// @notice Stop counting beats and start the withdrawal cooldown.
    function deregister(uint256 id) external deviceExists(id) {
        Device storage d = devices[id];
        if (msg.sender != d.operator) revert NotOperator();
        if (d.deregisteredAt != 0) revert NotActive();

        d.deregisteredAt = uint64(block.timestamp);
        emit Deregistered(id, block.timestamp);
    }

    /// @notice Withdraw remaining stake once the cooldown after deregistration has elapsed.
    function withdraw(uint256 id) external deviceExists(id) {
        Device storage d = devices[id];
        if (msg.sender != d.operator) revert NotOperator();
        if (d.deregisteredAt == 0) revert StillActive();
        if (block.timestamp - d.deregisteredAt < WITHDRAW_COOLDOWN) revert CooldownNotElapsed();

        uint256 amount = d.stake;
        address operator = d.operator;
        delete devices[id];

        emit Withdrawn(id, operator, amount);
        _send(operator, amount);
    }

    /// @notice Paginated read of devices and their live scores, for the dashboard.
    function getDevices(uint256 offset, uint256 limit)
        external
        view
        returns (uint256[] memory ids, Device[] memory list, uint16[] memory scores)
    {
        uint256 total = deviceCount;
        if (offset >= total) {
            return (new uint256[](0), new Device[](0), new uint16[](0));
        }
        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 n = end - offset;

        ids = new uint256[](n);
        list = new Device[](n);
        scores = new uint16[](n);
        for (uint256 i = 0; i < n; i++) {
            uint256 id = offset + i + 1;
            ids[i] = id;
            list[i] = devices[id];
            scores[i] = scoreOf(id);
        }
    }

    function _roll(Device storage d) internal {
        uint256 L = uint256(d.intervalSec) * WINDOW_BEATS;
        uint256 elapsed = block.timestamp - d.windowStart;

        if (elapsed >= 2 * L) {
            d.beatsPrev = 0;
            d.beatsCurr = 0;
            d.windowStart = uint64(block.timestamp);
        } else if (elapsed >= L) {
            d.beatsPrev = d.beatsCurr;
            d.beatsCurr = 0;
            d.windowStart = d.windowStart + uint64(L);
        }
    }

    function _send(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
