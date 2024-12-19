import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Action';

function Editor({socketRef, roomId, onCodeChange}) {

    const editorRef = useRef(null);
    useEffect(()=>{

        // Initialize CodeMirror editor
        const init = async () =>{
            editorRef.current = Codemirror.fromTextArea(document.getElementById("realtimeEditor"),{
                mode:{name:'javascript', json:true},
                theme:'dracula',
                autoCloseTags:true,
                autoCloseBrackets:true,
                lineNumbers:true,
            })

            // Listen for changes in the editor
            editorRef.current.on('change',(instance, changes)=>{

                const {origin} = changes;
                const code = instance.getValue();
                onCodeChange(code)  // this function will pass current code to parent element i.e editorPage

                if(origin !== 'setValue'){
                    // Emit code changes to the server
                    socketRef.current.emit(ACTIONS.CODE_CHANGE,{
                        roomId,
                        code,
                    })
                }
            })

        }
        init();

        // Cleanup: Destroy the CodeMirror instance
        return()=>{
            editorRef.current.toTextArea(); //destroy CodeMirror instance
            editorRef.current = null;
        }
    },[])

    useEffect(() => {

        // Listen for code changes from the server
        const handleCodeChange = ({ code }) => {
            if (editorRef.current && code !== null) {
                const currentCode = editorRef.current.getValue();
                if (currentCode !== code) {
                    editorRef.current.setValue(code);
                }
            }
        };

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE,handleCodeChange);
        }

        return () => {
            if(socketRef.current){

                socketRef.current.off(ACTIONS.CODE_CHANGE);
            }
        };
    }, [socketRef.current]);

    return <textarea id="realtimeEditor"></textarea>;
}

export default Editor