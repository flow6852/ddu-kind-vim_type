import { Denops, fn, vars } from "https://deno.land/x/ddu_vim@v2.7.0/deps.ts";
import {
  Actions,
  DduItem,
  Previewer,
  PreviewContext,BaseKind, ActionFlags 
} from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";

export interface ActionData {
  value: string;
  type: string;
  scope?: string;
}

type PreviewParams = {
  kind?: string;
}

type Params = Record<never, never>

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
      }

      return ActionFlags.Persist;
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
    const params = args.actionParams as PreviewParams;
    const action = args.item.action as ActionData;
    if (!action) {
      return await Promise.resolve(undefined);
    }
    let ret: Previewer;
    switch (params.kind) {
      case "help":
        ret =  await getFromHelp(args.denops, args.item.word)
        break;
      case "value":
        ret = {
          kind: "nofile",
          contents: showValue(action.value),
        };
        break;
      default:
        ret = {
          kind: "nofile",
          contents: showValue(action.value),
        };
        break;
    }
    return await Promise.resolve(ret);
  }

  override params(): Params {
    return {
    };
  }
}

async function getFromHelp(denops: Denops, word: string): Promise<Previewer>{
  let ret = {kind: "nofile", context: ["don't exist help file"]}
  const files = (await fn.globpath(denops, await fn.getbufvar(denops, await fn.bufnr(denops, "%"), "&rtp") as Array<string>, "doc/*.txt") as string).split("\n")
  for (const file of files){
    const lines = (await Deno.readTextFile(file)).split("\n")
    for(let i = 0; i < lines.length; i++){
      if(lines[i].indexOf("\*" + word + "\*") > -1){
        ret = {
          kind: "buffer",
          path: file,
          lineNr: i
        }
        break
      }
    }
  }
  return ret
}

// need parse?
function showValue(value: string): Array<string>{
  return value.split("\n")
}
