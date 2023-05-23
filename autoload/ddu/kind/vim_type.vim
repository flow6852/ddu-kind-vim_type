if exists('g:loaded_ddu_source_vim_type')
    finish
endif

let g:loaded_ddu_source_vim_type = 1

function ddu#kind#vim_type#_feedkeysWithLeft(str, pos) abort
    let l:keys = ""
    let l:pos = a:pos
    while l:pos != 0
        if l:pos < 0
            let l:keys = l:keys . "\<Left>"
            let l:pos = l:pos + 1
        else
            let l:keys = l:keys . "\<Right>"
            let l:pos = l:pos - 1
        endif 
    endwhile
    call feedkeys(a:str . l:keys)
endfunction
