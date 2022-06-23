//
const fs = require ('fs');
const path = require ('path');
//
const { compare } = require ('./ids.js');
//
let unencoded = { };
//
let characters = { };
//
// Copy of https://babelstone.co.uk/CJK/IDS.TXT (consistent with the BabelStoneHanPUA.ttf font)
let lines = fs.readFileSync (path.join (__dirname, 'IDS', 'IDS.TXT'), { encoding: 'utf8' }).replace (/^\uFEFF/, "").split (/\r?\n/);
for (let line of lines)
{
    if (line)
    {
        if (line[0] === "#")
        {            
            let found = line.match (/^#\t(\{\d+\})\t(.*)\(([0-9A-Fa-f]{4}) (.)\)/u);
            if (found)
            {
                let number = found[1];
                let comment = found[2].trim ();
                let codePoint = found[3];
                let character = found[4];
                if (String.fromCodePoint (parseInt (codePoint.replace ("U+", ""), 16)) !== character)
                {
                    console.log ("PUA code point and character mismatch:", codePoint, character);
                }
                unencoded[number] = { codePoint, character, comment };
            }
        }
        else
        {
            let fields = line.split ("\t");
            let codePoint = fields[0];
            let character = fields[1];
            if (String.fromCodePoint (parseInt (codePoint.replace ("U+", ""), 16)) !== character)
            {
                console.log ("Code point and character mismatch:", codePoint, character);
            }
            let data = { };
            let sequences = [ ];
            let strings = fields.slice (2);
            for (let string of strings)
            {
                if (string[0] === "*")
                {
                    data.notes = string.slice (1).trim ();
                }
                else
                {
                    let found = string.match (/^\^(.*)\$(?:\((.*)\))?$/u);
                    if (found)
                    {
                        function numberedComponent (number)
                        {
                            let component;
                            if (unencoded[number])
                            {
                                component = unencoded[number].character;
                            }
                            else
                            {
                                component = "！";
                                console.log (`Invalid numbered component: ${number} for ${codePoint} ${character}`);
                            }
                            return component;
                        }
                        let ids = found[1].replace (/\{\d+\}/gu, numberedComponent);
                        let source = found[2];
                        if (!source)
                        {
                            console.log (`Missing source: ${codePoint} ${character}`);
                        }
                        sequences.push ({ ids, source });
                        if (compare (Array.from (ids)) !== 0)
                        {
                            console.log (`Non well-formed IDS: ${codePoint} ${character} ${ids}`);
                        }
                    }
                    else
                    {
                        console.log ("Unrecognized format:", codePoint, character, string);
                    }
                }
            }
            data.sequences = sequences;
            characters[character] = data;
        }
    }
}
//
let unencodedComponents = { };
//
for (let number in unencoded)
{
    let value = unencoded[number];
    unencodedComponents[value.character] = { number, comment: value.comment };
}
//
module.exports = { characters, unencodedComponents };
//
