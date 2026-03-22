import { useRef, useState } from 'react'
import { Upload, File, X } from 'lucide-react'
import clsx from 'clsx'

export default function FileUpload({ accept = '.fasta', onFile, label = 'Upload FASTA File', hint = '' }) {
    const inputRef = useRef(null)
    const [dragging, setDragging] = useState(false)
    const [file, setFile] = useState(null)

    function handleFile(f) {
        if (!f) return
        setFile(f)
        onFile?.(f)
    }

    function onDrop(e) {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        handleFile(f)
    }

    function clearFile(e) {
        e.stopPropagation()
        setFile(null)
        onFile?.(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-mono text-cyber-muted mb-2 uppercase tracking-widest">
                    {label}
                </label>
            )}
            <div
                onClick={() => !file && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={clsx(
                    'relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group',
                    dragging
                        ? 'border-cyber-accent bg-cyber-accentDim'
                        : file
                            ? 'border-cyber-accent/40 bg-cyber-accentDim/40 cursor-default'
                            : 'border-cyber-border hover:border-cyber-accent/50 hover:bg-cyber-accentDim/20',
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                {file ? (
                    <div className="flex items-center gap-3 w-full">
                        <div className="p-2 bg-cyber-accent/10 rounded-lg">
                            <File size={20} className="text-cyber-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-cyber-text truncate">{file.name}</p>
                            <p className="text-xs text-cyber-muted">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                            onClick={clearFile}
                            className="p-1.5 rounded-lg hover:bg-cyber-red/20 text-cyber-muted hover:text-cyber-red transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-3 bg-cyber-border rounded-xl group-hover:bg-cyber-accentDim transition-all">
                            <Upload size={22} className="text-cyber-muted group-hover:text-cyber-accent transition-colors" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-cyber-text">
                                Drop file here or <span className="text-cyber-accent">browse</span>
                            </p>
                            {hint && <p className="text-xs text-cyber-muted mt-1">{hint}</p>}
                            <p className="text-xs text-cyber-muted/60 mt-1">Accepts: {accept}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
