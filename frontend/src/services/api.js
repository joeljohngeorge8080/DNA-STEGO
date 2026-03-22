/**
 * api.js — Backend API Service Layer
 *
 * All endpoints are proxied in dev via vite.config.js → /api → http://localhost:8000
 * In production, set VITE_API_BASE to the backend URL.
 */

const BASE = import.meta.env.VITE_API_BASE ?? ''

async function handleResponse(res) {
    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
    }
    // Download endpoints return blobs
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) return res.json()
    return res.blob()
}

/**
 * Encrypt a message into a FASTA file.
 * @param {string} message      — plaintext message
 * @param {File}   fastaFile    — original .fasta file
 * @returns {{ stego_file: string, key: string }}
 */
export async function encryptMessage(message, fastaFile) {
    const body = new FormData()
    body.append('message', message)
    body.append('fasta_file', fastaFile)

    const res = await fetch(`${BASE}/api/encrypt`, { method: 'POST', body })
    return handleResponse(res)
}

/**
 * Download the generated stego FASTA file.
 * @param {string} filePath — path returned from encryptMessage
 * @returns {Blob}
 */
export async function downloadStegoFile(filePath) {
    const url = `${BASE}/api/download?path=${encodeURIComponent(filePath)}`
    const res = await fetch(url)
    return handleResponse(res)
}

/**
 * Decrypt a stego FASTA file.
 * @param {File}   stegoFile — the stego .fasta file
 * @param {string} key       — encryption key from encrypt step
 * @returns {{ message: string }}
 */
export async function decryptMessage(stegoFile, key) {
    const body = new FormData()
    body.append('stego_file', stegoFile)
    body.append('key', key)

    const res = await fetch(`${BASE}/api/decrypt`, { method: 'POST', body })
    return handleResponse(res)
}

/**
 * Trigger a browser download from a Blob.
 */
export function triggerDownload(blob, filename = 'encoded.fasta') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
