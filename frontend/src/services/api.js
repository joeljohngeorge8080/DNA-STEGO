const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

async function handleResponse(res) {
    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
    }
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) return res.json()
    return res.blob()
}

export async function encryptMessage(message, fastaFile, useEncryption = true) {
    const body = new FormData()
    body.append('message', message)
    body.append('use_encryption', useEncryption ? 'true' : 'false')
    if (fastaFile) body.append('fasta_file', fastaFile)
    const res = await fetch(`${BASE}/api/encrypt`, { method: 'POST', body })
    return handleResponse(res)
}

export async function downloadStegoFile(filePath) {
    const url = `${BASE}/api/download?path=${encodeURIComponent(filePath)}`
    const res = await fetch(url)
    return handleResponse(res)
}

export async function decryptMessage(stegoFile, key = '') {
    const body = new FormData()
    body.append('stego_file', stegoFile)
    body.append('key', key)
    const res = await fetch(`${BASE}/api/decrypt`, { method: 'POST', body })
    return handleResponse(res)
}

export function triggerDownload(blob, filename = 'encoded.fasta') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

