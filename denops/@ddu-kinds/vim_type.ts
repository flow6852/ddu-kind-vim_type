import { Denops, fn, vars } from "https://deno.land/x/ddu_vim@v2.7.0/deps.ts";
import {
  ActionFlags,
  Actions,
  BaseKind,
  DduItem,
  DduOptions,
  PreviewContext,
  Previewer,
} from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";

export interface ActionData {
  value: string;
  type: string;
  scope?: string;
}

type SetcmdlineActionParams = {
  getcmdline: string;
  getcmdpos: number;
};

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    yank: async (args: { denops: Denops; items: DduItem[] }) => {
      for (const item of args.items) {
        const action = item?.action as ActionData;
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
        if (action.type == "function") {
          await args.denops.call(
            "ddu#kind#vim_type#_feedkeysWithLeft",
            ":" + words,
          );
        } else {
          await fn.feedkeys(
            args.denops,
            ":" + words,
          );
        }
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
    const action = args.item.action as ActionData;
    if (!action) {
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
