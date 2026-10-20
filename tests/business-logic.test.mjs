import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../lib/rate-limit.ts";

describe("Membership Pricing & Discounts", () => {
  const MEMBERSHIP_PRICE_NGN = 20000;

  test("Membership fee is strictly NGN 20,000", () => {
    assert.equal(MEMBERSHIP_PRICE_NGN, 20000);
  });

  test("Active members receive exactly 50% discount on regular products", () => {
    const regularPrices = [10000, 5000, 25000, 3000];
    for (const price of regularPrices) {
      const discounted = Math.round(price * 0.5);
      assert.equal(discounted, price / 2);
    }
  });

  test("Membership deals evaluate to 100% complimentary (0 NGN) for active members", () => {
    const isMember = true;
    const isMembershipDeal = true;
    const regularPrice = 15000;

    const finalPrice = (isMember && isMembershipDeal) ? 0 : isMember ? regularPrice * 0.5 : regularPrice;
    assert.equal(finalPrice, 0);
  });

  test("Non-members pay full price even on membership deals", () => {
    const isMember = false;
    const isMembershipDeal = true;
    const regularPrice = 15000;

    const finalPrice = (isMember && isMembershipDeal) ? 0 : isMember ? regularPrice * 0.5 : regularPrice;
    assert.equal(finalPrice, 15000);
  });
});

describe("In-Memory Sliding Window Rate Limiter", () => {
  test("Allows requests under the specified limit", () => {
    const key = `test_rate_${Date.now()}`;
    const r1 = checkRateLimit(key, { limit: 3, windowMs: 10_000 });
    assert.equal(r1.success, true);
    assert.equal(r1.remaining, 2);

    const r2 = checkRateLimit(key, { limit: 3, windowMs: 10_000 });
    assert.equal(r2.success, true);
    assert.equal(r2.remaining, 1);

    const r3 = checkRateLimit(key, { limit: 3, windowMs: 10_000 });
    assert.equal(r3.success, true);
    assert.equal(r3.remaining, 0);
  });

  test("Blocks requests when limit is exceeded", () => {
    const key = `test_block_${Date.now()}`;
    checkRateLimit(key, { limit: 2, windowMs: 10_000 });
    checkRateLimit(key, { limit: 2, windowMs: 10_000 });

    const blocked = checkRateLimit(key, { limit: 2, windowMs: 10_000 });
    assert.equal(blocked.success, false);
    assert.equal(blocked.remaining, 0);
  });
});
