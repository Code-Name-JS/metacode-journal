/* =====================================================
   script-v1.js  –  html-study v1.0 Interactions
   ===================================================== */

(function () {
  'use strict';


    
    /* -- DOM 요소 -- */
    const textarea = document.getElementById("code");
    const reset = document.getElementById("reset");
    const solution = document.getElementById("solution");
    const output = document.querySelector(".output");

    const code = textarea.value;
    const htmlSolution = '<p>A link to my <a href="https://www.mozilla.org/" title="The Mozilla homepage" target="_blank">favorite website</a>.</p>';
    
    let userEntry = textarea.value;
    let solutionEntry = htmlSolution;



    /* -- 함수 -- */
    function updateCode() {
        output.innerHTML = textarea.value;
    }



    /* -- 이벤트 리스너리 -- */
    textarea.addEventListener("input", function () {
        userEntry = textarea.value;
        updateCode(); 
    });

    window.addEventListener("load", function () {
        updateCode();
    });

    reset.addEventListener("click", function () {
        textarea.value = code;
        userEntry = textarea.value;

        solutionEntry = htmlSolution;
        solution.value = "Show solution";

        updateCode();
    });

    solution.addEventListener("click", function () {
        if (solution.value === "Show solution") {
            textarea.value = solutionEntry;
            solution.value = "Hide solution";
        } else {
            textarea.value = userEntry;
            solution.value = "Show solution";
        }
        updateCode();
    });



    /* -- textarea 함수 실행 -- */
    textarea.onkeydown = function (e) {
        if (e.key === "Tab") {
            e.preventDefault();
            insertAtCaret("\t");
        }

        if (e.key === "Escape") {
            textarea.blur();
        }
    };



    /* -- textarea의 문자열 삽입 -- */
    function insertAtCaret(text) {
        const scrollPos = textarea.scrollTop;
        let caretPos = textarea.selectionStart;

        const front = textarea.value.substring(0, caretPos);
        const back = textarea.value.substring(
            textarea.selectionEnd,
            textarea.value.length,
        );
        textarea.value = front + text + back;
        caretPos = caretPos + text.length;
        textarea.selectionStart = caretPos;
        textarea.selectionEnd = caretPos;
        textarea.focus();
        textarea.scrollTop = scrollPos;
    }



    /* -- textarea 실행 코드 -- */
    textarea.onkeyup = function () {
        if (solution.value === "Show solution") {
            userEntry = textarea.value;
        } else {
            solutionEntry = textarea.value;
        }

        updateCode();
    };
})();