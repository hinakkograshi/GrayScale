let originalImage;
let jsTimeCache = 0;
let wasmTimeCache = 0;

// DOM要素の取得は index.html 側の script で行うことを前提とします

/**
 * グレースケール変換のコアロジック (JS)
 * Wasmとの比較のために独立させる
 */
function jsGrayscale(data, length) {
     // 処理後のデータ格納用 (元の配列のコピー)
    const processedData = new Uint8ClampedArray(data);
    
    // RGBAデータ（4バイト/ピクセル）に対して反復処理
    for (let i = 0; i < length; i += 4) {
        // R, G, B の平均を計算 (グレースケール値)
        const avg = (processedData[i] + processedData[i + 1] + processedData[i + 2]) / 3;

        // R, G, B の値を平均値で置き換える
        processedData[i]     = avg; // R
        processedData[i + 1] = avg; // G
        processedData[i + 2] = avg; // B
        // A (i + 3) は変更しない
    }
    return processedData;
}

/**
 * 処理結果の時間を比較し、UIを更新する
 */
function updateComparison(comparisonResultElement) {
    if (jsTimeCache > 0 && wasmTimeCache > 0) {
        const fasterTime = Math.min(jsTimeCache, wasmTimeCache);
        const slowerTime = Math.max(jsTimeCache, wasmTimeCache);
        const ratio = (slowerTime / fasterTime).toFixed(2);
        
        let message;
        if (wasmTimeCache < jsTimeCache) {
            message = `SwiftWasmはJavaScriptの ${ratio} 倍高速でした。`;
        } else if (jsTimeCache < wasmTimeCache) {
            message = `JavaScriptはSwiftWasmの ${ratio} 倍高速でした。`;
        } else {
            message = `JavaScriptとSwiftWasmの実行時間はほぼ同等でした。`;
        }
        comparisonResultElement.textContent = `パフォーマンス比較: ${message}`;
    }
}


/**
 * グレースケール処理の実行（共通ラッパー）
 */
function processImage(mode, originalCanvas, processedCanvas, processJsButton, processWasmButton, statusMessage, timeResultJs, timeResultWasm, comparisonResult) {
    if (!originalImage) return;

    // ボタンの無効化
    processJsButton.disabled = true;
    processWasmButton.disabled = true;

    const width = originalCanvas.width;
    const height = originalCanvas.height;
    const ctx = originalCanvas.getContext('2d');
    
    // オリジナル画像データ（処理用）を取得
    let imageData = ctx.getImageData(0, 0, width, height);
    
    // 初期メッセージ
    statusMessage.textContent = `${mode === 'js' ? 'JavaScript' : 'SwiftWasm'} 処理を実行中...`;
    
    // 計測開始
    const startTime = performance.now();
    let processedData;

    if (mode === 'js') {
        processedData = jsGrayscale(imageData.data, imageData.data.length);

    } else if (mode === 'wasm') {
        // ----------------------------------------------------
        // 💡 SwiftWasm版の呼び出しロジック (ダミー)
        // ----------------------------------------------------
        
        // 🚨 Wasm連携に必要なロジックは index.html のコメントを参照
        // ここでは比較のため、ダミーとしてJS関数を呼び出す
        processedData = jsGrayscale(imageData.data, imageData.data.length); 
    }

    // --- パフォーマンス計測終了 ---
    const endTime = performance.now();
    const timeMs = (endTime - startTime).toFixed(2);
    
    // 処理後のデータを新しいImageDataオブジェクトに設定
    let finalImageData = ctx.createImageData(width, height);
    finalImageData.data.set(processedData);

    // 処理後のデータを新しいキャンバスに描画
    processedCanvas.getContext('2d').putImageData(finalImageData, 0, 0);

    if (mode === 'js') {
        jsTimeCache = parseFloat(timeMs);
        timeResultJs.textContent = `実行時間 (JavaScript): ${timeMs} ミリ秒`;
    } else {
        wasmTimeCache = parseFloat(timeMs);
        timeResultWasm.textContent = `実行時間 (SwiftWasm): ${timeMs} ミリ秒`;
    }

    statusMessage.textContent = `${mode === 'js' ? 'JavaScript' : 'SwiftWasm'} 処理が完了しました。`;
    processJsButton.disabled = false;
    processWasmButton.disabled = false;
    
    updateComparison(comparisonResult);
}

/**
 * 画像選択処理
 */
function handleImageSelection(event, originalCanvas, processedCanvas, processJsButton, processWasmButton, statusMessage, timeResultJs, timeResultWasm, comparisonResult) {
    const file = event.target.files[0];
    if (!file) return;

    statusMessage.textContent = '画像をロード中...';
    timeResultJs.textContent = '';
    timeResultWasm.textContent = '';
    comparisonResult.textContent = '';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            originalImage = img;
            
            // キャンバスのサイズを画像に合わせる
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            processedCanvas.width = img.width;
            processedCanvas.height = img.height;
            
            // オリジナルキャンバスに画像を描画
            const ctx = originalCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            // 処理後のキャンバスをクリア
            processedCanvas.getContext('2d').clearRect(0, 0, img.width, img.height);
            
            statusMessage.textContent = `画像がロードされました。サイズ: ${img.width} x ${img.height}`;
            
            // ボタンの有効化
            processJsButton.disabled = false;
            processWasmButton.disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}