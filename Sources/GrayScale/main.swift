import JavaScriptKit

let document = JSObject.global.document

JSObject.global["convertBySwift"] = .object(
    JSClosure { args in
        let dataJS = args[0].object!
        let typedArray = JSUInt8ClampedArray(unsafelyWrapping: dataJS)
        return typedArray.withUnsafeBytes { makeGrascale(data: $0) }.jsValue
    }
)

func makeGrascale(data: UnsafeBufferPointer<UInt8>) -> JSUInt8ClampedArray {
    let count = data.count
    // 新しいバッファをアロケートし、元のデータで初期化（コピー）
    let out = UnsafeMutableBufferPointer<UInt8>.allocate(capacity: count)
    // 画像のアルファチャンネル（透明度）が適切に保持されるようになった
    // i+3 の位置（アルファ値）への書き込みがなかったため、out[i + 3]の値は未初期化のまま.
    // 0 に近かった場合、透明に見えてしまっていた
    _ = out.initialize(from: data) // <- 初期化とコピーを同時に実行

    defer {
        // out.deallocate() の代わりに、JSUInt8ClampedArrayの生成時に渡すことで、
        // Swiftのメモリ管理の外に出す（Wasmではこの部分の扱いに注意が必要）
        // ただし、この関数内で完結させるなら deallocate は必要
        out.deallocate()
    }

    // 2. グレースケール計算のみを実行
    for i in stride(from: 0, to: count, by: 4) {
        let r = Float(out[i])
        let g = Float(out[i + 1])
        let b = Float(out[i + 2])

        // 輝度アルゴリズム
        let grayValue = UInt8(0.299 * r + 0.587 * g + 0.114 * b)

        out[i] = grayValue     // Rを上書き
        out[i + 1] = grayValue // Gを上書き
        out[i + 2] = grayValue // Bを上書き
        // out[i + 3] (アルファ値) は変更しない
    }
    
    // 3. 結果を返す
    return JSUInt8ClampedArray(buffer: UnsafeBufferPointer(out))
}