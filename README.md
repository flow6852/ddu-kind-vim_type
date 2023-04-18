# ddu-kind-vim_type

Vim type kind for ddu.vim.

## Required

### denops.vim

https://github.com/vim-denops/denops.vim

### ddu.vim

https://github.com/Shougo/ddu.vim

## Configuration

```vim
	cmap <silent> <C-h> <Cmd>call DduKindVim_typeSetcmdline()<CR>

	function DduKindVim_typeSetcmdline()
	    let getcmdline = getcmdline()
	    call feedkeys("\<Esc>", 't')
	    call ddu#start({'name': 'vim_variable', 'sources': [
	        \ {'name': 'vim_variable', 'params': {'bufnr': bufnr('%')}},
	        \ {'name': 'vim_option', 'params': {'bufnr': bufnr('%')}},
	        \ {'name': 'vim_function', 'params': {'bufnr': bufnr('%')}},
	        \ {'name': 'vim_command', 'params': {'bufnr': bufnr('%')}},
	        \ {'name': 'vim_event', 'params': {'bufnr': bufnr('%')}}],
	        \ 'actionParams': {'getcmdline': getcmdline}})
	endfunction
```
