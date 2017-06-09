
import index = require("./index");

export class Diff implements index.Difference{
    constructor(public _path:string, public _value0:any, public _value1:any, public _comment:string) {
        this._path = _path;
        this._value0 = _value0;
        this._value1 = _value1;
        this._comment=_comment;
    }

    message(label0?:string,label1?:string):string{
        label0 = label0||"value0";
        label1 = label1||"value1";

        var strValue0:string = "undefined";
        var strValue1:string = "undefined";
        if(this._value0!=null) {
            try {
                strValue0 = JSON.stringify(this._value0, null, 2).trim();
            }
            catch (err) {
                strValue0 = this._value0.toString();
            }
        }
        if(this._value1!=null) {
            try {
                strValue1 = JSON.stringify(this._value1, null, 2).trim();
            }
            catch (err) {
                strValue1 = this._value1.toString();
            }
        }

        return `path: ${this._path}
comment: ${this._comment}
${label0}: ${strValue0}
${label1}: ${strValue1}`
    }

    values(){
        return [ this._value0, this._value1 ]
    }

    path(){
        return this._path;
    }

}

export function compare(arg0:any,arg1:any,path:string=''):Diff[] {

    var diffs:Diff[] = [];
    if(arg0==null){
        if(arg1!=null) {
            diffs.push(new Diff(path, arg0, arg1, 'Defined/undefined mismatch'));
            return diffs;
        }
    }
    else if(arg1==null){
        diffs.push(new Diff(path,arg0,arg1,'Defined/undefined mismatch'));
        return diffs;
    }
    else if(Array.isArray(arg0)){
        if(!Array.isArray(arg1)){
            diffs.push(new Diff(path,arg0,arg1,'Array/' + typeof(arg1)+' mismatch'));
            return diffs;
        }
        else {
            var l0 = arg0.length;
            var l1 = arg1.length;
            if (l1 != l0) {
                diffs.push(new Diff(path, arg0, arg1, 'Array lengths mismatch'));
                return diffs;
            }
            var l = Math.min(l0, l1);
            for (var i = 0; i < l; i++) {
                diffs = diffs.concat(compare(arg0[i], arg1[i], path + '[' + i + ']'));
            }
        }
    }
    else if(arg0 instanceof Object){
        if(!(arg1 instanceof Object)){
            diffs.push(new Diff(path,arg0,arg1,'Object/' + typeof(arg1)+' mismatch'));
            return diffs;
        }
        else {
            var keys0 = Object.keys(arg0);
            var keys1 = Object.keys(arg1);
            var map:{[key:string]:boolean} = {}
            for (var i = 0; i < keys0.length; i++) {
                var key = keys0[i];
                map[key] = true;
                var val0 = arg0[key];
                var val1 = arg1[key];
                diffs = diffs.concat(compare(val0, val1, path + '/' + key));
            }
            for (var i = 0; i < keys1.length; i++) {
                var key = keys1[i];
                if (map[key]) {
                    continue;
                }
                var val0 = arg0[key];
                var val1 = arg1[key];
                diffs = diffs.concat(compare(val0, val1, path + '/' + key));
            }
        }
    }
    else {
        if(arg0 !== arg1){
            if(!(typeof arg0 == "number" && typeof arg1 == "number" && isNaN(arg0)&&isNaN(arg1))) {
                diffs.push(new Diff(path, arg0, arg1, 'Inequal values'));
            }
        }
    }
    return diffs;
}
