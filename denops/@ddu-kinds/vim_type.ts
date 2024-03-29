import { Denops, fn, vars } from "https://deno.land/x/ddu_vim@v3.10.1/deps.ts";
import {
  ActionFlags,
  Actions,
  BaseKind,
  DduItem,
  DduOptions,
  PreviewContext,
  Previewer,
} from "https://deno.land/x/ddu_vim@v3.10.1/types.ts";
import { assert, is } from "https://deno.land/x/unknownutil@v3.14.1/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v5.3.0/batch/mod.ts";
import {
  getreginfo,
  setreg,
} from "https://deno.land/x/denops_std@v5.3.0/function/mod.ts";

export interface ActionData {
  value: string;
  type: string;
  scope?: string;
}

const isActionData = is.ObjectOf({
  value: is.String,
  type: is.String,
});

type SetcmdlineActionParams = {
  getcmdline: string;
  getcmdpos: number;
};

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    yank: async (args: { denops: Denops; items: DduItem[] }) => {
      for (const item of args.items) {
        const action: unknown = item.action;
        assert(action, isActionData);
        const value = action.value;
        await fn.setreg(args.denops, '"', value, "v");
        await fn.setreg(
          args.denops,
          await vars.v.get(args.denops, "register"),
          value,
          "v",
        );
        console.log(value);
      }
      return ActionFlags.None;
    },
    setcmdline: async (
      args: { denops: Denops; items: DduItem[]; options: DduOptions },
    ) => {
      const actionParams: Partial<SetcmdlineActionParams> =
        args.options.actionParams;
      const getcmdline: string = actionParams.getcmdline ?? "";
      const getcmdpos: number = actionParams.getcmdpos ?? 1;
      for (const item of args.items) {
        const action: ActionData = item.action as ActionData;
        const words: string = getcmdline.slice(
          0,
          getcmdpos - 1,
        ) + item.word +
          getcmdline.slice(
            getcmdpos - 1,
            getcmdline.length,
          );
        const pos = action.type == "function" ? -1 : 0;
        await args.denops.call(
          "ddu#kind#vim_type#_feedkeysWithLeft",
          ":" + words,
          pos,
        );
      }
      return ActionFlags.None;
    },
    append: async ({ items, denops }) => {
      for (const item of items) {
        await put(denops, item.word, true);
      }
      return ActionFlags.None;
    },
    insert: async ({ items, denops }) => {
      for (const item of items) {
        await put(denops, item.word, false);
      }
      return ActionFlags.None;
    },
  };

  override async getPreviewer(
    args: {
      denops: Denops;
      item: DduItem;
      actionParams: unknown;
      previewContext: PreviewContext;
    },
  ): Promise<Previewer | undefined> {
    const action = assert(args.item.action, isActionData);
    if (!isActionData(action)) {
      return await Promise.resolve(undefined);
    }

    return await Promise.resolve({
      kind: "nofile",
      contents: showValue(action.value),
    });
  }

  override params(): Params {
    return {
      getcmdline: "",
      getcmdpos: 0,
    };
  }
}

// need parse?
function showValue(value: string | Array<string>): Array<string> {
  return Array.isArray(value)
    ? value
    : (typeof (value) == "string" ? value.split("\n") : [value]);
}

async function put(denops: Denops, word: string, after: boolean) {
  await batch(denops, async (denops) => {
    const oldReg = await getreginfo(denops, '"');

    await setreg(denops, '"', word, "v");
    try {
      await denops.cmd(`normal! ""${after ? "p" : "P"}`);
    } finally {
      if (oldReg) {
        await setreg(denops, '"', oldReg);
      }
    }
  });
}
