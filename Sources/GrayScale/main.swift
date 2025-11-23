import JavaScriptKit

let document = JSObject.global.document

JSObject.global["convertBySwift"] = .object(
    JSClosure { args in
        let dataJS = args[0].object!
        let lengthJS = args[1].number!
        let typedArray = JSUInt8ClampedArray(unsafelyWrapping: dataJS)
        return typedArray.withUnsafeBytes { makeGrascale(data: $0) }.jsValue
    }
)

func makeGrascale(data: UnsafeBufferPointer<UInt8>) -> JSUInt8ClampedArray {
    let out = UnsafeMutableBufferPointer<UInt8>.allocate(capacity: data.count)
    defer {
        out.deallocate()
    }
    do {
        for i in stride(from: 0, to: data.count, by: 4) {
            let r = Float(data[i])
            let g = Float(data[i + 1])
            let b = Float(data[i + 2])
            let gray = UInt8(0.299 * r + 0.587 * g + 0.114 * b)
            out[i] = gray
            out[i + 1] = gray
            out[i + 2] = gray
        }
    }
    return JSUInt8ClampedArray(buffer: UnsafeBufferPointer(out))
}
