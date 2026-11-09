// node --test scripts/clean-email.test.mjs  (npm run test:email)
// Emails that look valid but contain invisible / look-alike characters must be recovered,
// and genuinely wrong ones must still be rejected.
import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { cleanEmail } from "../src/lib/clean-email.ts";

const valid = (v) => z.email().safeParse(cleanEmail(v)).success;

test("a normal address is untouched", () => {
  assert.equal(cleanEmail("mostafashorif0@gmail.com"), "mostafashorif0@gmail.com");
});

test("invisible direction / zero-width characters are removed", () => {
  assert.equal(cleanEmail("mostafashorif0‎@gmail.com"), "mostafashorif0@gmail.com"); // LRM
  assert.equal(cleanEmail("mostafashorif0@gmail.com‏"), "mostafashorif0@gmail.com"); // RLM
  assert.equal(cleanEmail("mostafashorif0​@gmail.com"), "mostafashorif0@gmail.com"); // zero-width space
  assert.equal(cleanEmail("‫mostafashorif0@gmail.com‬"), "mostafashorif0@gmail.com"); // embedding marks
  assert.equal(cleanEmail("﻿mostafashorif0@gmail.com"), "mostafashorif0@gmail.com"); // BOM
});

test("Arabic-Indic and Eastern Arabic-Indic digits become ASCII digits", () => {
  assert.equal(cleanEmail("mostafashorif٠@gmail.com"), "mostafashorif0@gmail.com");
  assert.equal(cleanEmail("ahmed١٢٣@gmail.com"), "ahmed123@gmail.com");
  assert.equal(cleanEmail("ahmed۴۵@gmail.com"), "ahmed45@gmail.com");
});

test("surrounding whitespace is trimmed", () => {
  assert.equal(cleanEmail("  a@b.co \n"), "a@b.co");
  assert.equal(cleanEmail("a@b.co "), "a@b.co");
});

test("empty / missing stays empty", () => {
  assert.equal(cleanEmail(""), "");
  assert.equal(cleanEmail(undefined), "");
  assert.equal(cleanEmail(null), "");
});

test("the addresses that were failing now validate", () => {
  for (const v of ["mostafashorif0‎@gmail.com", "mostafashorif0@gmail.com‏", "mostafashorif٠@gmail.com", "x​x@gmail.com"]) {
    assert.equal(valid(v), true, JSON.stringify(v));
  }
});

test("genuinely wrong addresses are still rejected", () => {
  for (const v of ["mostafashorif0gmail.com", "mostafashorif0@", "@gmail.com", "a b@gmail.com", "mostafashorif0@gmail", "mоstafa@gmail.com" /* Cyrillic o */]) {
    assert.equal(valid(v), false, JSON.stringify(v));
  }
});
