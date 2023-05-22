if exists('g:loaded_ddu_source_vim_type')
    finish
endif

let g:loaded_ddu_source_vim_type = 1

function ddu#kind#vim_type#_feedkeysWithLeft(str) abort
    call feedkeys(a:str . "\<Left>")
endfunction
