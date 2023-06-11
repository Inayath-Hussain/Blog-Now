import { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import BalloonBuildEditor from 'ckeditor5-custom-build/build/ckeditor';
import { useRouter } from "next/router";
import viewToPlainText from "@ckeditor/ckeditor5-clipboard/src/utils/viewtoplaintext"

export interface CKeditorProps {
    onChange: (data: string, plainText: string) => void;
    editorLoaded: boolean;
    name: string;
    value: string;
    user: string,
    draft_id: string,
    disable: boolean
}

const Editor = (
    { editorLoaded,
        onChange,
        name,
        value,
        user,
        draft_id,
        disable }: CKeditorProps
) => {
    const router = useRouter()
    console.log('draft_id...', draft_id)
    const editorRef = useRef<{ CKEditor: typeof CKEditor, BalloonEditor: typeof BalloonBuildEditor }>();
    useEffect(() => {
        try {
            editorRef.current = {
                CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
                BalloonEditor: require('ckeditor5-custom-build/build/ckeditor')
            }
        } catch (ex) {
            console.log(ex)
            router.reload()
        }
    }, [])

    function uploadAdapter(loader: any) {
        return {
            upload: () => {
                return new Promise((resolve, reject) => {
                    const form = new FormData();
                    loader.file.then((file: any) => {
                        form.append("image", file);
                        form.append("user", user);
                        form.append('draft_id', draft_id);

                        fetch('/api/image/uploadForBlog', {
                            method: "POST",
                            body: form
                        })
                            .then((res) => res.json())
                            .then((res) => {
                                console.log('EDITOR.....', res)
                                resolve({
                                    default: `${res}`
                                });
                            })
                            .catch((err) => {
                                console.log
                                reject(err);
                            });
                    });
                });
            }
        };
    }

    function uploadPlugin(editor: any) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
            return uploadAdapter(loader);
        };
    }

    return editorLoaded ? (
        <div className="py-4 pr-8 pl-11">
            <CKEditor disabled={disable}
                config={{
                    extraPlugins: [uploadPlugin],
                    removePlugins: ["MediaEmbedToolbar"],
                    placeholder: 'Content Here',

                }}
                editor={BalloonBuildEditor}
                data={value}
                //this is used to add custom css to editor
                onReady={(editor) => {
                    editor.editing.view.change((writer: any) => {
                        writer.setStyle(
                            "padding",
                            "30px",
                            editor.editing.view.document.getRoot()
                        );
                        writer.setStyle(
                            "border",
                            "none",
                            editor.editing.view.document.getRoot()
                        );
                        writer.setStyle(
                            "box-shadow",
                            "none",
                            editor.editing.view.document.getRoot()
                        );
                        writer.setStyle(
                            "font-size",
                            "1.3rem",
                            editor.editing.view.document.getRoot()
                        );
                    });
                }}
                onChange={async (event: any, editor: any) => {
                    const data = editor.getData();
                    // const plainText = event.editor.editable().getText();
                    // \<.*?\>
                    // /(<([^>]+)>)/ig
                    console.log(data);
                    // console.log('plain text', data.replaceAll(/(<([^>]+)>)/ig, ''));
                    console.log('plain text', data.replaceAll(/(<([^>]+)>)/ig, '').replaceAll(/(&([^>]+);)/ig, ""));
                    onChange(data, '');
                }}
            // config={{
            //     toolbar: [
            //         "heading",
            //         "|",
            //         "bold",
            //         "italic",
            //         "link",
            //         "bulletedList",
            //         "numberedList",
            //         "blockQuote",
            //     ],
            // }}
            />
        </div>
    ) : (<div></div>);
}

export default Editor;