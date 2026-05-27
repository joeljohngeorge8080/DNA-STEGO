/**
 * api.js — Backend API Service Layer v2
 *
 * All endpoints are proxied in dev via vite.config.js → /api → http://localhost:8000
 */

const BASE = import.meta.env.VITE_API_BASE ?? ''

async function handleResponse(res) {
    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
    }
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) return res.json()
    return res.blob()
}

/**
 * Encrypt a message into a stego FASTA file.
 *
 * @param {string}   message        — plaintext message
 * @param {File|null} fastaFile     — cover FASTA file, or null to use server default
 * @param {boolean}  useEncryption  — true → AES protected; false → key-free
 * @returns {{ stego_file: string, key: string|null, encrypted: boolean }}
 */
export async function encryptMessage(message, fastaFile, useEncryption = true) {
    const body = new FormData()
    body.append('message', message)
    body.append('use_encryption', useEncryption ? 'true' : 'false')

    if (fastaFile) {
        body.append('fasta_file', fastaFile)
    }
    // If no file is provided, the backend falls back to default.fasta

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
 *
 * @param {File}     stegoFile — the stego .fasta file
 * @param {string}   key       — AES key, or "" if the file was encoded key-free
 * @returns {{ message: string }}
 */
export async function decryptMessage(stegoFile, key = '') {
    const body = new FormData()
    body.append('stego_file', stegoFile)
    body.append('key', key)          // empty string is fine — backend handles it

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
