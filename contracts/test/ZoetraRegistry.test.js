const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const MIN_STAKE = ethers.parseEther("0.05");
const INTERVAL = 5; // seconds
const WINDOW_BEATS = 20;
const L = INTERVAL * WINDOW_BEATS; // 100s bucket
const SLA_BPS = 9000; // 90%

async function deploy() {
  const [deployer, operator, verifier, other] = await ethers.getSigners();
  const Registry = await ethers.getContractFactory("ZoetraRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  return { registry, deployer, operator, verifier, other };
}

async function registerDevice(registry, operator, overrides = {}) {
  const tx = await registry
    .connect(operator)
    .register(overrides.name ?? "device-a", overrides.interval ?? INTERVAL, overrides.sla ?? SLA_BPS, {
      value: overrides.stake ?? MIN_STAKE,
    });
  await tx.wait();
  return await registry.deviceCount();
}

// Pins the exact block timestamp for the heartbeat tx so test timing matches the
// hand-traced score math precisely; without this, Hardhat's default +1s-per-block
// auto-advance makes "every INTERVAL seconds" actually INTERVAL+1, skewing scores.
async function beatAt(registry, operator, id, timestamp) {
  await time.setNextBlockTimestamp(timestamp);
  await registry.connect(operator).heartbeat(id);
}

async function beatOnSchedule(registry, operator, id, interval, count) {
  const device = await registry.devices(id);
  const start = Number(device.registeredAt);
  for (let i = 1; i <= count; i++) {
    await beatAt(registry, operator, id, start + i * interval);
  }
  return start;
}

describe("ZoetraRegistry", function () {
  describe("register", function () {
    it("rejects stake below MIN_STAKE", async function () {
      const { registry, operator } = await deploy();
      await expect(
        registry.connect(operator).register("d", INTERVAL, SLA_BPS, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWithCustomError(registry, "InsufficientStake");
    });

    it("rejects out-of-range interval", async function () {
      const { registry, operator } = await deploy();
      await expect(
        registry.connect(operator).register("d", 2, SLA_BPS, { value: MIN_STAKE })
      ).to.be.revertedWithCustomError(registry, "BadInterval");
      await expect(
        registry.connect(operator).register("d", 400, SLA_BPS, { value: MIN_STAKE })
      ).to.be.revertedWithCustomError(registry, "BadInterval");
    });

    it("rejects out-of-range SLA", async function () {
      const { registry, operator } = await deploy();
      await expect(
        registry.connect(operator).register("d", INTERVAL, 100, { value: MIN_STAKE })
      ).to.be.revertedWithCustomError(registry, "BadSla");
    });

    it("assigns sequential ids and emits Registered", async function () {
      const { registry, operator } = await deploy();
      await expect(registry.connect(operator).register("device-a", INTERVAL, SLA_BPS, { value: MIN_STAKE }))
        .to.emit(registry, "Registered")
        .withArgs(1n, operator.address, "device-a", INTERVAL, SLA_BPS, MIN_STAKE);
      const id2 = await registerDevice(registry, operator, { name: "device-b" });
      expect(id2).to.equal(2n);
    });

    it("shows 100% score before any beat is due", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator);
      expect(await registry.scoreOf(id)).to.equal(10000);
    });
  });

  describe("heartbeat + scoreOf", function () {
    it("only the operator wallet can beat", async function () {
      const { registry, operator, other } = await deploy();
      const id = await registerDevice(registry, operator);
      await expect(registry.connect(other).heartbeat(id)).to.be.revertedWithCustomError(registry, "NotOperator");
    });

    it("reverts heartbeat on unknown device", async function () {
      const { registry, operator } = await deploy();
      await expect(registry.connect(operator).heartbeat(999)).to.be.revertedWithCustomError(registry, "UnknownDevice");
    });

    it("stays near 100% while beating on schedule", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator);

      await beatOnSchedule(registry, operator, id, INTERVAL, 15);

      expect(await registry.scoreOf(id)).to.equal(10000);
    });

    it("carries score across a bucket roll when beating stays on schedule", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator);

      // beat every interval for more than one full bucket (L = 100s => 20 beats)
      await beatOnSchedule(registry, operator, id, INTERVAL, 25);

      expect(await registry.scoreOf(id)).to.equal(10000);
    });

    it("decays visibly within seconds after beats stop", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator);

      // warm up past one full bucket so a real "prev" bucket exists
      const start = await beatOnSchedule(registry, operator, id, INTERVAL, 21);
      expect(await registry.scoreOf(id)).to.equal(10000);
      const lastBeatAt = start + 21 * INTERVAL;

      // device dies: no more heartbeats, just let time pass
      await time.increaseTo(lastBeatAt + 15); // 3 missed intervals
      const scoreAfter15s = await registry.scoreOf(id);
      expect(scoreAfter15s).to.be.lt(10000);

      await time.increaseTo(lastBeatAt + 30); // 30s total dead
      const scoreAfter30s = await registry.scoreOf(id);
      expect(scoreAfter30s).to.be.lt(scoreAfter15s);
    });

    it("recovers gradually once heartbeats resume, not instantly", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator);

      const start = await beatOnSchedule(registry, operator, id, INTERVAL, 21);
      const lastBeatAt = start + 21 * INTERVAL;

      // let it fully die (well past 2L)
      const deadUntil = lastBeatAt + 2 * L + 10;
      await time.increaseTo(deadUntil);
      expect(await registry.scoreOf(id)).to.equal(0);

      await beatAt(registry, operator, id, deadUntil + 1);
      const scoreJustAfterRevival = await registry.scoreOf(id);
      expect(scoreJustAfterRevival).to.be.gt(0);
      expect(scoreJustAfterRevival).to.be.lt(9000); // one beat does not erase a dead history

      // the revival beat starts a fresh bucket; scores only reach 100% again once
      // that bucket fully rolls into "prev" (one more full L of on-schedule beats)
      const revivedAt = deadUntil + 1;
      for (let i = 1; i <= 20; i++) {
        await beatAt(registry, operator, id, revivedAt + i * INTERVAL);
      }
      expect(await registry.scoreOf(id)).to.equal(10000);
    });

    it("emits Beat with the post-beat score", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator);
      await beatOnSchedule(registry, operator, id, INTERVAL, 1);
      const device = await registry.devices(id);
      await time.setNextBlockTimestamp(Number(device.registeredAt) + 2 * INTERVAL);
      await expect(registry.connect(operator).heartbeat(id)).to.emit(registry, "Beat");
    });

    it("rejects heartbeats after deregistration", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator);
      await registry.connect(operator).deregister(id);
      await expect(registry.connect(operator).heartbeat(id)).to.be.revertedWithCustomError(registry, "NotActive");
    });
  });

  describe("slash", function () {
    it("reverts while score is at or above the SLA threshold", async function () {
      const { registry, operator, verifier } = await deploy();
      const id = await registerDevice(registry, operator);
      await expect(registry.connect(verifier).slash(id)).to.be.revertedWithCustomError(registry, "ScoreAboveThreshold");
    });

    it("succeeds once score breaches SLA, pays bounty, burns remainder, is permissionless", async function () {
      const { registry, operator, verifier } = await deploy();
      const id = await registerDevice(registry, operator, { sla: 9000 });

      const start = await beatOnSchedule(registry, operator, id, INTERVAL, 21);

      // kill it: let score fall below 90%
      await time.increaseTo(start + 21 * INTERVAL + 20);
      expect(await registry.scoreOf(id)).to.be.lt(9000);

      const before = await ethers.provider.getBalance(verifier.address);
      const tx = await registry.connect(verifier).slash(id);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const after = await ethers.provider.getBalance(verifier.address);

      const device = await registry.devices(id);
      const expectedSlashAmount = (MIN_STAKE * 2000n) / 10000n;
      const expectedBounty = (expectedSlashAmount * 1000n) / 10000n;

      expect(device.stake).to.equal(MIN_STAKE - expectedSlashAmount);
      expect(after - before + gasCost).to.equal(expectedBounty);

      await expect(tx).to.emit(registry, "Slashed");
    });

    it("enforces a cooldown between slashes", async function () {
      const { registry, operator, verifier } = await deploy();
      const id = await registerDevice(registry, operator, { sla: 9000, stake: ethers.parseEther("1") });

      const start = await beatOnSchedule(registry, operator, id, INTERVAL, 21);
      await time.increaseTo(start + 21 * INTERVAL + 20);
      await registry.connect(verifier).slash(id);

      await expect(registry.connect(verifier).slash(id)).to.be.revertedWithCustomError(registry, "SlashCooldown");
    });

    it("reverts slash on a deregistered device", async function () {
      const { registry, operator, verifier } = await deploy();
      const id = await registerDevice(registry, operator);
      await registry.connect(operator).deregister(id);
      await expect(registry.connect(verifier).slash(id)).to.be.revertedWithCustomError(registry, "NotActive");
    });
  });

  describe("deregister + withdraw", function () {
    it("only operator can deregister", async function () {
      const { registry, operator, other } = await deploy();
      const id = await registerDevice(registry, operator);
      await expect(registry.connect(other).deregister(id)).to.be.revertedWithCustomError(registry, "NotOperator");
    });

    it("blocks withdraw before cooldown and before deregistration", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator);
      await expect(registry.connect(operator).withdraw(id)).to.be.revertedWithCustomError(registry, "StillActive");

      await registry.connect(operator).deregister(id);
      await expect(registry.connect(operator).withdraw(id)).to.be.revertedWithCustomError(registry, "CooldownNotElapsed");
    });

    it("returns exact remaining stake after cooldown", async function () {
      const { registry, operator } = await deploy();
      const id = await registerDevice(registry, operator, { stake: ethers.parseEther("0.2") });
      await registry.connect(operator).deregister(id);
      await time.increase(61);

      const before = await ethers.provider.getBalance(operator.address);
      const tx = await registry.connect(operator).withdraw(id);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const after = await ethers.provider.getBalance(operator.address);

      expect(after - before + gasCost).to.equal(ethers.parseEther("0.2"));

      const device = await registry.devices(id);
      expect(device.operator).to.equal(ethers.ZeroAddress);
    });

    it("only operator can withdraw", async function () {
      const { registry, operator, other } = await deploy();
      const id = await registerDevice(registry, operator);
      await registry.connect(operator).deregister(id);
      await time.increase(61);
      await expect(registry.connect(other).withdraw(id)).to.be.revertedWithCustomError(registry, "NotOperator");
    });
  });

  describe("getDevices", function () {
    it("paginates and returns live scores", async function () {
      const { registry, operator } = await deploy();
      await registerDevice(registry, operator, { name: "a" });
      await registerDevice(registry, operator, { name: "b" });
      await registerDevice(registry, operator, { name: "c" });

      const [ids, list, scores] = await registry.getDevices(0, 2);
      expect(ids.length).to.equal(2);
      expect(list[0].name).to.equal("a");
      expect(list[1].name).to.equal("b");
      expect(scores.length).to.equal(2);

      const [idsPage2] = await registry.getDevices(2, 2);
      expect(idsPage2.length).to.equal(1);
    });

    it("returns empty arrays when offset is past the end", async function () {
      const { registry, operator } = await deploy();
      await registerDevice(registry, operator);
      const [ids] = await registry.getDevices(5, 10);
      expect(ids.length).to.equal(0);
    });
  });
});
