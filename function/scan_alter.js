const fs = require("fs");
const Tesseract = require("tesseract.js");


const target_text = [
    'LordEndoHD'
]

async function scan_img(filePath) {
    const result = await Tesseract.recognize(filePath, "eng", {
        logger: (m) => console.log(m),
    });
    const text = result.data.text.toLowerCase();

    for (const target of target_text) {
        if (text.includes(target.toLowerCase())) {
            return true;
        }
    }
    return false;
}

async function scan_alter(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
        }
        const isTargetFound = await scan_img(req.file.path);
        console.log(`Scanning file: ${req.file.path}, Target found: ${isTargetFound}`);

        return res.json({
            status: 'success',
            message: isTargetFound ? 'Target ditemukan dalam gambar.' : 'Target tidak ditemukan dalam gambar.'
            , data: {
                targetFound: isTargetFound
            }
        });
        
    } catch (error) {
        console.error('Error during image scanning:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memproses gambar.', details: error.message });
    } finally {
        if (req.file?.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Gagal menghapus file upload sementara:', unlinkError.message);
            }
        }
    }
    
}

module.exports = scan_alter;