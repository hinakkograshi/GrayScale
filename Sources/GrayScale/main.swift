import JavaScriptKit

JSObject.global["convertBySwift"] = .object(
    JSClosure { args in
        let imageDataJS = args[0].object!
        let typedArray = JSUInt8ClampedArray(unsafelyWrapping: imageDataJS)
        return typedArray.withUnsafeBytes { makeGrascale(data: $0) }.jsValue
    }
)

func makeGrascale(data: UnsafeBufferPointer<UInt8>) -> JSUInt8ClampedArray {
    let count = data.count
    // 新しいバッファをアロケートし、元のデータで初期化（コピー）
    let out = UnsafeMutableBufferPointer<UInt8>.allocate(capacity: count)
    _ = out.initialize(from: data) // <- 初期化とコピーを同時に実行

    defer {
        out.deallocate()
    }

    // グレースケール計算を実行
    for i in stride(from: 0, to: count, by: 4) {
        let r = Float(out[i])
        let g = Float(out[i + 1])
        let b = Float(out[i + 2])

        // 輝度アルゴリズム
        let grayValue = UInt8(0.299 * r + 0.587 * g + 0.114 * b)

        out[i] = grayValue     // Rを上書き
        out[i + 1] = grayValue // Gを上書き
        out[i + 2] = grayValue // Bを上書き
    }
    
    // 結果を返す
    return JSUInt8ClampedArray(buffer: UnsafeBufferPointer(out))
}