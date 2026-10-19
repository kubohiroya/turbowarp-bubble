import assert from "node:assert/strict";
import test from "node:test";
import { ownerNative, flush } from "./fixtures/fixed-native.mjs";
const opcode = "defineBubbleClosePolicy";
const seed = {
  TRIGGER: { literal: "timeout" },
  TIMEOUT: { literal: "10" },
  CONDITION: { literal: "ready" },
};
test("BC06 native reporter selector keeps TIMEOUT readonly", async (t) => {
  const f = ownerNative(opcode, { ...seed, TRIGGER: { source: "reporter" } });
  t.after(f.close);
  assert.equal(
    f.definition.describeFixed(f.session.getDraft(), f.read()).inputs.TIMEOUT
      .state,
    "readonly",
  );
  const before = f.state();
  assert.deepEqual(await f.session.save(), { status: "saved", changed: false });
  assert.deepEqual(f.state(), before);
});
for (const [id, condition] of [
  ["BC07", { literal: "  " }],
  ["BC08", { source: "reporter" }],
])
  test(`${id} native branch rejects unverifiable readonly CONDITION without partial commit`, async (t) => {
    const f = ownerNative(opcode, { ...seed, CONDITION: condition });
    t.after(f.close);
    const before = f.state();
    f.set("TRIGGER", "condition");
    assert.equal((await f.session.save()).status, "invalid");
    assert.deepEqual(f.state(), before);
  });
test("BC09 native TIMEOUT-only save retains CONDITION reporter and supports undo/redo", async (t) => {
  const f = ownerNative(opcode, {
    ...seed,
    TRIGGER: { literal: "condition-or-timeout" },
    CONDITION: { source: "reporter" },
  });
  t.after(f.close);
  f.set("TIMEOUT", 20, "20");
  assert.equal((await f.session.save()).status, "saved");
  assert.equal(f.vmValue("TIMEOUT"), "20");
  assert.equal(
    f.blocks.getBlock("owner-root").inputs.CONDITION.block,
    "CONDITION-reporter",
  );
  assert.equal(f.workspace.undoStack_.length, 1);
  assert.equal(f.dirty(), 1);
  f.workspace.undo(false);
  await flush();
  assert.equal(f.vmValue("TIMEOUT"), "10");
  f.workspace.undo(true);
  await flush();
  assert.equal(f.vmValue("TIMEOUT"), "20");
});
test("BC10 native readonly dependency conflict prevents the entire pending save", async (t) => {
  const f = ownerNative(opcode, seed);
  t.after(f.close);
  f.set("TIMEOUT", 20, "20");
  f.outside("CONDITION", "outside");
  const before = f.state();
  assert.equal((await f.session.save()).status, "conflict");
  assert.deepEqual(f.state(), before);
  assert.equal(f.vmValue("TIMEOUT"), "10");
});
test("BC12 native atomic host rejects readonly and legal changes together", (t) => {
  const f = ownerNative(opcode, seed);
  t.after(f.close);
  const before = f.state();
  assert.throws(() =>
    f.commit([
      { argument: "CONDITION", value: "forged" },
      { argument: "TIMEOUT", value: "20" },
    ]),
  );
  assert.deepEqual(f.state(), before);
});
test("BC13 native hidden draft retains invalid buffer and discards it on successful close", async (t) => {
  const f = ownerNative(opcode, seed);
  t.after(f.close);
  f.set("TIMEOUT", 20, "20");
  f.set("TRIGGER", "condition");
  assert.equal(f.session.getDraft().inputs.TIMEOUT.buffer, "20");
  assert.equal(f.vmValue("TIMEOUT"), "10");
  f.set("TRIGGER", "timeout");
  assert.equal(f.session.getDraft().inputs.TIMEOUT.buffer, "20");
  f.set("TIMEOUT", 20, "1e");
  f.set("TRIGGER", "condition");
  f.set("TRIGGER", "timeout");
  assert.equal((await f.session.save()).status, "invalid");
  assert.equal(f.session.getDraft().inputs.TIMEOUT.buffer, "1e");
  f.set("TRIGGER", "condition");
  assert.equal((await f.session.save()).status, "saved");
  f.session.dispose();
  assert.throws(() => f.session.getDraft(), /closed/);
  assert.equal(f.vmValue("TIMEOUT"), "10");
  const reopened = f.open();
  assert.equal(reopened.getDraft().inputs.TIMEOUT.value, 10);
  assert.equal(reopened.getDraft().inputs.TIMEOUT.buffer, undefined);
  reopened.dispose();
});
test("BC14 native unsupported and missing selector preserve dependent inputs", async () => {
  for (const source of ["unsupported", "missing"]) {
    const f = ownerNative(opcode, { ...seed, TRIGGER: { source } });
    try {
      const before = f.state();
      assert.equal(
        f.definition.describeFixed(f.session.getDraft(), f.read()).inputs
          .TIMEOUT.state,
        "readonly",
      );
      assert.deepEqual(await f.session.save(), {
        status: "saved",
        changed: false,
      });
      assert.deepEqual(f.state(), before);
    } finally {
      f.close();
    }
  }
});
test("BC15 native selector change cannot replace required TIMEOUT reporter", async (t) => {
  const f = ownerNative(opcode, {
    ...seed,
    TRIGGER: { literal: "condition" },
    TIMEOUT: { source: "reporter" },
  });
  t.after(f.close);
  const before = f.state();
  f.set("TRIGGER", "timeout");
  assert.equal((await f.session.save()).status, "invalid");
  assert.deepEqual(f.state(), before);
});
test("BC16 native unknown selector repair to timeout does not require CONDITION evaluation", async (t) => {
  const f = ownerNative(opcode, {
    ...seed,
    CONDITION: { source: "unsupported" },
  });
  t.after(f.close);
  const originalCondition = f.vmValue("CONDITION");
  const field = f.workspace
    .getBlockById("TRIGGER-shadow")
    .getField("closePolicyTrigger");
  field.value_ = "unknown";
  f.blocks.getBlock("TRIGGER-shadow").fields.closePolicyTrigger.value =
    "unknown";
  f.session.dispose();
  const session = f.open();
  const draft = session.getDraft();
  draft.inputs.TRIGGER = { value: "timeout", changed: true, repair: true };
  session.setDraft(draft);
  assert.equal((await session.save()).status, "saved");
  assert.equal(f.vmValue("TRIGGER"), "timeout");
  assert.equal(f.vmValue("TIMEOUT"), "10");
  assert.equal(f.vmValue("CONDITION"), originalCondition);
  session.dispose();
});

test("native selector-only changes preserve existing numeric aliases while new alias edits fail", async () => {
  for (const raw of ["0x10", "+1", "001", "1."]) {
    const f = ownerNative(opcode, {
      ...seed,
      TRIGGER: { literal: "condition" },
    });
    try {
      f.workspace.getBlockById("TIMEOUT-shadow").getField("NUM").text_ = raw;
      f.blocks.getBlock("TIMEOUT-shadow").fields.NUM.value = raw;
      f.session.dispose();
      const session = f.open();
      const draft = session.getDraft();
      draft.inputs.TRIGGER = { value: "timeout", changed: true };
      session.setDraft(draft);
      assert.equal((await session.save()).status, "saved");
      assert.equal(f.vmValue("TIMEOUT"), raw);
      assert.equal(f.value("TIMEOUT"), raw);
      session.dispose();
    } finally {
      f.close();
    }
    const changed = ownerNative(opcode, seed);
    try {
      const before = changed.state();
      changed.set("TIMEOUT", raw);
      assert.equal((await changed.session.save()).status, "invalid");
      assert.deepEqual(changed.state(), before);
    } finally {
      changed.close();
    }
  }
});
