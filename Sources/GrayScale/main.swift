import JavaScriptKit

let document = JSObject.global.document

JSObject.global["convertBySwift"] = .object(
    JSClosure { args in
        let dataJS = args[0].object!
        let lengthJS = args[1].number!
        let typedArray = JSUInt8ClampedArray(unsafelyWrapping: dataJS)
        var data: [UInt8] = typedArray.withUnsafeBytes { Array($0) }
        let convertedData = makeGrascale(data: data)
        
        print("converting by Swift")
        return JSUInt8ClampedArray(convertedData).jsValue
    }
)

func makeGrascale(data:[UInt8]) -> [UInt8] {
    var grayData = data
    for i in stride(from: 0, to: data.count, by: 4) {
        let r = Float(data[i])
        let g = Float(data[i + 1])
        let b = Float(data[i + 2])
        let gray = UInt8(0.299 * r + 0.587 * g + 0.114 * b)
        grayData[i] = gray
        grayData[i + 1] = gray
        grayData[i + 2] = gray
    }
    return grayData
}