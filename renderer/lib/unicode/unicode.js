//
const unicodeData = require ('./parsed-unicode-data.js');
const extraData = require ('./parsed-extra-data.js');
//
const entities = require ('./parsed-xhtml-character-entities.js');
//
const characterCount = Object.keys (unicodeData).length;
//
const planes =
[
    { name: "Basic Multilingual Plane (BMP)", first: "0000", last: "FFFF" },
    { name: "Supplementary Multilingual Plane (SMP)", first: "10000", last: "1FFFF" },
    { name: "Supplementary Ideographic Plane (SIP)", first: "20000", last: "2FFFF" },
    { name: "Tertiary Ideographic Plane (TIP)", first: "30000", last: "3FFFF" },
    // { name: "Unassigned", first: "40000", last: "DFFFF" },
    { name: "Supplementary Special-purpose Plane (SSP)", first: "E0000", last: "EFFFF" },
    { name: "Private Use Plane (15)", first: "F0000", last: "FFFFF" },
    { name: "Private Use Plane (16)", first: "100000", last: "10FFFF" }
];
//
// https://www.unicode.org/Public/UNIDATA/PropertyValueAliases.txt
const categories =
{
    "Lu": "Uppercase_Letter",           // an uppercase letter
    "Ll": "Lowercase_Letter",           // a lowercase letter
    "Lt": "Titlecase_Letter",           // a digraphic character, with first part uppercase
    "LC": "Cased_Letter",               // Lu | Ll | Lt
    "Lm": "Modifier_Letter",            // a modifier letter
    "Lo": "Other_Letter",               // other letters, including syllables and ideographs
    "L": "Letter",                      // Lu | Ll | Lt | Lm | Lo
    //
    "Mn": "Nonspacing_Mark",           // a nonspacing combining mark (zero advance width)
    "Mc": "Spacing_Mark",               // a spacing combining mark (positive advance width)
    "Me": "Enclosing_Mark",             // an enclosing combining mark
    "M": "Mark",                        // Mn | Mc | Me
    //
    "Nd": "Decimal_Number",             // a decimal digit
    "Nl": "Letter_Number",              // a letterlike numeric character
    "No": "Other_Number",               // a numeric character of other type
    "N": "Number",                      // Nd | Nl | No
    //
    "Pc": "Connector_Punctuation",      // a connecting punctuation mark, like a tie
    "Pd": "Dash_Punctuation",           // a dash or hyphen punctuation mark
    "Ps": "Open_Punctuation",           // an opening punctuation mark (of a pair)
    "Pe": "Close_Punctuation",          // a closing punctuation mark (of a pair)
    "Pi": "Initial_Punctuation",        // an initial quotation mark
    "Pf": "Final_Punctuation",          // a final quotation mark
    "Po": "Other_Punctuation",          // a punctuation mark of other type
    "P": "Punctuation",                 // Pc | Pd | Ps | Pe | Pi | Pf | Po
    //
    "Sm": "Math_Symbol",                // a symbol of mathematical use
    "Sc": "Currency_Symbol",            // a currency sign
    "Sk": "Modifier_Symbol",            // a non-letterlike modifier symbol
    "So": "Other_Symbol",               // a symbol of other type
    "S": "Symbol",                      // Sm | Sc | Sk | So
    //
    "Zs": "Space_Separator",            // a space character (of various non-zero widths)
    "Zl": "Line_Separator",             // U+2028 LINE SEPARATOR only
    "Zp": "Paragraph_Separator",        // U+2029 PARAGRAPH SEPARATOR only
    "Z": "Separator",                   // Zs | Zl | Zp
    //
    "Cc": "Control",                    // a C0 or C1 control code
    "Cf": "Format",                     // a format control character
    "Cs": "Surrogate",                  // a surrogate code point
    "Co": "Private_Use",                // a private-use character
    "Cn": "Unassigned",                 // a reserved unassigned code point or a noncharacter (no characters in the file have this property)
    "C": "Other"                        // Cc | Cf | Cs | Co | Cn
};
//
// https://www.unicode.org/reports/tr44/#CCC_Values_Table
// https://www.unicode.org/Public/UNIDATA/extracted/DerivedCombiningClass.txt
const combiningClasses =
{
    "0": "Not_Reordered",           // Spacing and enclosing marks; also many vowel and consonant signs, even if nonspacing
    "1": "Overlay",                 // Marks which overlay a base letter or symbol
    "6": "Han_Reading",             // Diacritic reading marks for CJK unified ideographs
    "7": "Nukta",                   // Diacritic nukta marks in Brahmi-derived scripts
    "8": "Kana_Voicing",            // Hiragana/Katakana voicing marks
    "9": "Virama",                  // Viramas
    //
    "10": "CCC10",
    "11": "CCC11",
    "12": "CCC12",
    "13": "CCC13",
    "14": "CCC14",
    "15": "CCC15",
    "16": "CCC16",
    "17": "CCC17",
    "18": "CCC18",
    "19": "CCC19",
    "20": "CCC20",
    "21": "CCC21",
    "22": "CCC22",
    "23": "CCC23",
    "24": "CCC24",
    "25": "CCC25",
    "26": "CCC26",
    "27": "CCC28",
    "29": "CCC29",
    "30": "CCC30",
    "31": "CCC31",
    "32": "CCC32",
    "33": "CCC33",
    "34": "CCC34",
    "35": "CCC35",
    "36": "CCC36",
    "84": "CCC84",
    "91": "CCC91",
    "103": "CCC103",
    "107": "CCC107",
    "118": "CCC118",
    "122": "CCC122",
    "129": "CCC129",
    "130": "CCC130",
    "132": "CCC132",
    //
    "200": "Attached_Below_Left",   // Marks attached at the bottom left
    "202": "Attached_Below",        // Marks attached directly below
    "204": "Attached_Below_Right",  // Marks attached at the bottom right
    "208": "Attached_Left",         // Marks attached to the left
    "210": "Attached_Right",        // Marks attached to the right
    "212": "Attached_Above_Left",   // Marks attached at the top left
    "214": "Attached_Above",        // Marks attached directly above
    "216": "Attached_Above_Right",  // Marks attached at the top right
    "218": "Below_Left",            // Distinct marks at the bottom left
    "220": "Below",                 // Distinct marks directly below
    "222": "Below_Right",           // Distinct marks at the bottom right
    "224": "Left",                  // Distinct marks to the left
    "226": "Right",                 // Distinct marks to the right
    "228": "Above_Left",            // Distinct marks at the top left
    "230": "Above",                 // Distinct marks directly above
    "232": "Above_Right",           // Distinct marks at the top right
    "233": "Double_Below",          // Distinct marks subtending two bases
    "234": "Double_Above",          // Distinct marks extending above two bases
    "240": "Iota_Subscript"         // Greek iota subscript only
};
//
// https://www.unicode.org/reports/tr44/#BC_Values_Table
// https://www.unicode.org/Public/UNIDATA/extracted/DerivedBidiClass.txt
const bidiClasses =
{
    "L": "Left_To_Right",               // any strong left-to-right character
    "R": "Right_To_Left",               // any strong right-to-left (non-Arabic-type) character
    "AL": "Arabic_Letter",              // any strong right-to-left (Arabic-type) character
    //
    "EN": "European_Number",            // any ASCII digit or Eastern Arabic-Indic digit
    "ES": "European_Separator",         // plus and minus signs
    "ET": "European_Terminator",        // a terminator in a numeric format context, includes currency signs
    "AN": "Arabic_Number",              // any Arabic-Indic digit
    "CS": "Common_Separator",           // commas, colons, and slashes
    "NSM": "Nonspacing_Mark",           // any nonspacing mark
    "BN": "Boundary_Neutral",           // most format characters, control codes, or noncharacters
    //
    "B": "Paragraph_Separator",         // various newline characters
    "S": "Segment_Separator",           // various segment-related control codes
    "WS": "White_Space",                // spaces
    "ON": "Other_Neutral",              // most other symbols and punctuation marks
    //
    "LRE": "Left_To_Right_Embedding",   // U+202A: the LR embedding control
    "LRO": "Left_To_Right_Override",    // U+202D: the LR override control
    "RLE": "Right_To_Left_Embedding",   // U+202B: the RL embedding control
    "RLO": "Right_To_Left_Override",    // U+202E: the RL override control
    "PDF": "Pop_Directional_Format",    // U+202C: terminates an embedding or override control
    "LRI": "Left_To_Right_Isolate",     // U+2066: the LR isolate control
    "RLI": "Right_To_Left_Isolate",     // U+2067: the RL isolate control
    "FSI": "First_Strong_Isolate ",     // U+2068: the first strong isolate control
    "PDI": "Pop_Directional_Isolate"    // U+2069: terminates an isolate control
};
//
const mirrored =
{
    "N": "",    // Skip field if "No"...
    "Y": "Yes"
}
//
// https://www.unicode.org/Public/UNIDATA/PropertyValueAliases.txt
const scripts =
{
    "Adlm": "Adlam",
    "Ahom": "Ahom",
    "Hluw": "Anatolian_Hieroglyphs",
    "Arab": "Arabic",
    "Armn": "Armenian",
    "Avst": "Avestan",
    "Bali": "Balinese",
    "Bamu": "Bamum",
    "Bass": "Bassa_Vah",
    "Batk": "Batak",
    "Beng": "Bengali",
    "Bhks": "Bhaiksuki",
    "Bopo": "Bopomofo",
    "Brah": "Brahmi",
    "Brai": "Braille",
    "Bugi": "Buginese",
    "Buhd": "Buhid",
    "Cans": "Canadian_Aboriginal",
    "Cari": "Carian",
    "Aghb": "Caucasian_Albanian",
    "Cakm": "Chakma",
    "Cham": "Cham",
    "Cher": "Cherokee",
    "Chrs": "Chorasmian",
    "Zyyy": "Common",
    "Copt": "Coptic",
    "Qaac": "Coptic",   // alias?
    "Xsux": "Cuneiform",
    "Cprt": "Cypriot",
    "Cpmn": "Cypro_Minoan",
    "Cyrl": "Cyrillic",
    "Dsrt": "Deseret",
    "Deva": "Devanagari",
    "Diak": "Dives_Akuru",
    "Dogr": "Dogra",
    "Dupl": "Duployan",
    "Egyp": "Egyptian_Hieroglyphs",
    "Elba": "Elbasan",
    "Elym": "Elymaic",
    "Ethi": "Ethiopic",
    "Geor": "Georgian",
    "Glag": "Glagolitic",
    "Goth": "Gothic",
    "Gran": "Grantha",
    "Grek": "Greek",
    "Gujr": "Gujarati",
    "Gong": "Gunjala_Gondi",
    "Guru": "Gurmukhi",
    "Hani": "Han",
    "Hang": "Hangul",
    "Rohg": "Hanifi_Rohingya",
    "Hano": "Hanunoo",
    "Hatr": "Hatran",
    "Hebr": "Hebrew",
    "Hira": "Hiragana",
    "Armi": "Imperial_Aramaic",
    "Zinh": "Inherited",
    "Qaai": "Inherited",    // Alias?
    "Phli": "Inscriptional_Pahlavi",
    "Prti": "Inscriptional_Parthian",
    "Java": "Javanese",
    "Kthi": "Kaithi",
    "Knda": "Kannada",
    "Kana": "Katakana",
    "Hrkt": "Katakana_Or_Hiragana",
    "Kali": "Kayah_Li",
    "Khar": "Kharoshthi",
    "Kits": "Khitan_Small_Script",
    "Khmr": "Khmer",
    "Khoj": "Khojki",
    "Sind": "Khudawadi",
    "Laoo": "Lao",
    "Latn": "Latin",
    "Lepc": "Lepcha",
    "Limb": "Limbu",
    "Lina": "Linear_A",
    "Linb": "Linear_B",
    "Lisu": "Lisu",
    "Lyci": "Lycian",
    "Lydi": "Lydian",
    "Mahj": "Mahajani",
    "Maka": "Makasar",
    "Mlym": "Malayalam",
    "Mand": "Mandaic",
    "Mani": "Manichaean",
    "Marc": "Marchen",
    "Gonm": "Masaram_Gondi",
    "Medf": "Medefaidrin",
    "Mtei": "Meetei_Mayek",
    "Mend": "Mende_Kikakui",
    "Merc": "Meroitic_Cursive",
    "Mero": "Meroitic_Hieroglyphs",
    "Plrd": "Miao",
    "Modi": "Modi",
    "Mong": "Mongolian",
    "Mroo": "Mro",
    "Mult": "Multani",
    "Mymr": "Myanmar",
    "Nbat": "Nabataean",
    "Nand": "Nandinagari",
    "Talu": "New_Tai_Lue",
    "Newa": "Newa",
    "Nkoo": "Nko",
    "Nshu": "Nushu",
    "Hmnp": "Nyiakeng_Puachue_Hmong",
    "Ogam": "Ogham",
    "Olck": "Ol_Chiki",
    "Hung": "Old_Hungarian",
    "Ital": "Old_Italic",
    "Narb": "Old_North_Arabian",
    "Perm": "Old_Permic",
    "Xpeo": "Old_Persian",
    "Sogo": "Old_Sogdian",
    "Sarb": "Old_South_Arabian",
    "Orkh": "Old_Turkic",
    "Ougr": "Old_Uyghur",
    "Orya": "Oriya",
    "Osge": "Osage",
    "Osma": "Osmanya",
    "Hmng": "Pahawh_Hmong",
    "Palm": "Palmyrene",
    "Pauc": "Pau_Cin_Hau",
    "Phag": "Phags_Pa",
    "Phnx": "Phoenician",
    "Phlp": "Psalter_Pahlavi",
    "Rjng": "Rejang",
    "Runr": "Runic",
    "Samr": "Samaritan",
    "Saur": "Saurashtra",
    "Shrd": "Sharada",
    "Shaw": "Shavian",
    "Sidd": "Siddham",
    "Sgnw": "SignWriting",
    "Sinh": "Sinhala",
    "Sogd": "Sogdian",
    "Sora": "Sora_Sompeng",
    "Soyo": "Soyombo",
    "Sund": "Sundanese",
    "Sylo": "Syloti_Nagri",
    "Syrc": "Syriac",
    "Tglg": "Tagalog",
    "Tagb": "Tagbanwa",
    "Tale": "Tai_Le",
    "Lana": "Tai_Tham",
    "Tavt": "Tai_Viet",
    "Takr": "Takri",
    "Taml": "Tamil",
    "Tnsa": "Tangsa",
    "Tang": "Tangut",
    "Telu": "Telugu",
    "Thaa": "Thaana",
    "Thai": "Thai",
    "Tibt": "Tibetan",
    "Tfng": "Tifinagh",
    "Tirh": "Tirhuta",
    "Toto": "Toto",
    "Ugar": "Ugaritic",
    "Zzzz": "Unknown",
    "Vaii": "Vai",
    "Vith": "Vithkuqi",
    "Wcho": "Wancho",
    "Wara": "Warang_Citi",
    "Yezi": "Yezidi",
    "Yiii": "Yi",
    "Zanb": "Zanabazar_Square"
};
//
// https://www.unicode.org/Public/UNIDATA/PropertyValueAliases.txt
const eastAsianWidths =
{
    "A": "Ambiguous",
    "F": "Fullwidth",
    "H": "Halfwidth",
    // "N": "Neutral", // "Not East Asian"
    "Na": "Narrow",
    "W": "Wide"
};
//
// https://www.unicode.org/Public/UNIDATA/PropertyValueAliases.txt
const verticalOrientations =
{
    "U": "Upright", // Upright, the same orientation as in the code charts
    "R": "Rotated", // Rotated 90 degrees clockwise compared to the code charts
    "Tu": "Transformed_Upright", // Transformed typographically, with fallback to Upright
    "Tr": "Transformed_Rotated" // Transformed typographically, with fallback to Rotated
};
//
// https://www.unicode.org/Public/UNIDATA/PropertyValueAliases.txt
const lineBreaks =
{
    "AI": "Ambiguous",
    "AL": "Alphabetic",
    "B2": "Break_Both",
    "BA": "Break_After",
    "BB": "Break_Before",
    "BK": "Mandatory_Break",
    "CB": "Contingent_Break",
    "CJ": "Conditional_Japanese_Starter",
    "CL": "Close_Punctuation",
    "CM": "Combining_Mark",
    "CP": "Close_Parenthesis",
    "CR": "Carriage_Return",
    "EB": "E_Base",
    "EM": "E_Modifier",
    "EX": "Exclamation",
    "GL": "Glue",
    "H2": "H2",
    "H3": "H3",
    "HL": "Hebrew_Letter",
    "HY": "Hyphen",
    "ID": "Ideographic",
    "IN": "Inseparable",
    "IS": "Infix_Numeric",
    "JL": "JL",
    "JT": "JT",
    "JV": "JV",
    "LF": "Line_Feed",
    "NL": "Next_Line",
    "NS": "Nonstarter",
    "NU": "Numeric",
    "OP": "Open_Punctuation",
    "PO": "Postfix_Numeric",
    "PR": "Prefix_Numeric",
    "QU": "Quotation",
    "RI": "Regional_Indicator",
    "SA": "Complex_Context",
    "SG": "Surrogate",
    "SP": "Space",
    "SY": "Break_Symbols",
    "WJ": "Word_Joiner",
    "XX": "Unknown",
    "ZW": "ZWSpace",
    "ZWJ": "ZWJ"
};
//
// https://en.wikibooks.org/wiki/Unicode/Versions
// https://www.unicode.org/history/publicationdates.html
const versionDates =
{
    "1.0": "October 1991",
    "1.1": "June 1993",
    "2.0": "July 1996",
    "2.1": "May 1998",
    "3.0": "September 1999",
    "3.1": "March 2001",
    "3.2": "March 2002",
    "4.0": "April 2003",
    "4.1": "March 2005",
    "5.0": "July 2006",
    "5.1": "April 2008",
    "5.2": "October 2009",
    "6.0": "October 2010",
    "6.1": "January 2012",
    "6.2": "September 2012",
    "6.3": "September 2013",
    "7.0": "June 2014",
    "8.0": "June 2015",
    "9.0": "June 2016",
    "10.0": "June 2017",
    "11.0": "June 2018",
    "12.0": "March 2019",
    "12.1": "May 2019",
    "13.0": "March 2020",
    "14.0": "September 2021",
    "15.0": "September 2022"
};
//
function uniHexify (string)
{
    return string.replace (/\b([0-9a-fA-F]{4,})\b/g, "U\+$&");
}
//
function characterToUtf32Code (character)
{
    return character.codePointAt (0).toString (16).toUpperCase ().padStart (8, "0");
}
//
function characterToUtf16Code (character)
{
    let utf16Code = "";
    let index = character.codePointAt (0);
    if (index > 0xFFFF)
    {
        let highCode = character.charCodeAt (0).toString (16).toUpperCase ().padStart (4, "0");
        let lowCode = character.charCodeAt (1).toString (16).toUpperCase ().padStart (4, "0");
        utf16Code = `${highCode} ${lowCode}`;
    }
    else
    {
        utf16Code = index.toString (16).toUpperCase ().padStart (4, "0");
    }
    return utf16Code;
}
//
function characterToUtf8 (character)
{
    let utf8 = [ ];
    let buffer = Buffer.from (character, 'utf8');
    for (let byte of buffer)
    {
        utf8.push (byte.toString (16).toUpperCase ().padStart (2, "0"));
    }
    return utf8;
}
//
function characterToUtf8Code (character)
{
    return characterToUtf8 (character).join (" ");
}
//
function characterToUrlEncoding (character)
{
    return characterToUtf8 (character).map (code => `%${code}`).join ("");
}
//
function characterToHexEntity (character)
{
    return `&#x${character.codePointAt (0).toString (16).toUpperCase ()};`;
}
//
function characterToDecimalEntity (character)
{
    return `&#${character.codePointAt (0)};`;
}
//
function characterToNamedEntity (character)
{
    return entities[character];
}
//
function characterToJavaScriptEscape (character)
{
    let escape = "";
    let index = character.codePointAt (0);
    if (index > 0xFFFF)
    {
        let highCode = character.charCodeAt (0).toString (16).toUpperCase ().padStart (4, "0");
        let lowCode = character.charCodeAt (1).toString (16).toUpperCase ().padStart (4, "0");
        escape = `\\u${highCode}\\u${lowCode}`;
    }
    else
    {
        escape = `\\u${index.toString (16).toUpperCase ().padStart (4, "0")}`;
    }
    return escape;
}
//
function characterToEcmaScript6Escape (character)
{
    return `\\u{${character.codePointAt (0).toString (16).toUpperCase ()}}`;
}
//
function characterToCodePoint (character, noPrefix)
{
    let code = character.codePointAt (0).toString (16).toUpperCase ().padStart (4, "0");
    return (noPrefix) ? code : `U+${code}`;
}
//
function getCharacterData (character)
{
    let characterData = { };
    if (!(/^[\uD800-\uDFFF]$/.test (character))) // Or /^\p{Surrogate}$/ (isolated/lone surrogate)
    {
        characterData.utf32 = `<${characterToUtf32Code (character)}>`;
        characterData.utf16 = `<${characterToUtf16Code (character)}>`;
        characterData.utf8 = `<${characterToUtf8Code (character)}>`;
        characterData.urlEncoding = characterToUrlEncoding (character);
        characterData.hexEntity = characterToHexEntity (character);
        characterData.decimalEntity = characterToDecimalEntity (character);
        characterData.namedEntity = characterToNamedEntity (character);
        characterData.javaScript = characterToJavaScriptEscape (character);
        characterData.ecmaScript6 = characterToEcmaScript6Escape (character);
    }
    let codePoint = characterToCodePoint (character);
    characterData.character = character;
    characterData.codePoint = codePoint;
    let index = character.codePointAt (0);
    for (let plane of planes)
    {
        if ((parseInt (plane.first, 16) <= index) && (index <= parseInt (plane.last, 16)))
        {
            characterData.planeName = plane.name;
            characterData.planeRange = uniHexify (plane.first + ".." + plane.last);
            break;
        }
    }
    for (let block of extraData.blocks)
    {
        if ((parseInt (block.first, 16) <= index) && (index <= parseInt (block.last, 16)))
        {
            characterData.blockName = block.name;
            characterData.blockRange = uniHexify (block.first + ".." + block.last);
            break;
        }
    }
    for (let version of extraData.versions)
    {
        if ((parseInt (version.first, 16) <= index) && (index <= parseInt (version.last, 16)))
        {
            characterData.age = version.age;
            characterData.ageDate = versionDates[version.age] || "Date Unknown";
            break;
        }
    }
    for (let script of extraData.scripts)
    {
        if ((parseInt (script.first, 16) <= index) && (index <= parseInt (script.last, 16)))
        {
            characterData.script = script.name;
            break;
        }
    }
    for (let scriptExtension of extraData.scriptExtensions)
    {
        if ((parseInt (scriptExtension.first, 16) <= index) && (index <= parseInt (scriptExtension.last, 16)))
        {
            let names = scriptExtension.aliases.split (" ").map (alias => scripts[alias]);
            characterData.scriptExtensions = names.sort ((a, b) => a.localeCompare (b));
            break;
        }
    }
    let extendedProperties = [ ];
    for (let extendedProperty of extraData.extendedProperties)
    {
        if ((parseInt (extendedProperty.first, 16) <= index) && (index <= parseInt (extendedProperty.last, 16)))
        {
            extendedProperties.push (extendedProperty.name);
        }
    }
    if (extendedProperties.length > 0)
    {
        characterData.extendedProperties = extendedProperties.sort ((a, b) => a.localeCompare (b));
    }
    let coreProperties = [ ];
    for (let coreProperty of extraData.coreProperties)
    {
        if ((parseInt (coreProperty.first, 16) <= index) && (index <= parseInt (coreProperty.last, 16)))
        {
            coreProperties.push (coreProperty.name);
        }
    }
    if (coreProperties.length > 0)
    {
        characterData.coreProperties = coreProperties.sort ((a, b) => a.localeCompare (b));
    }
    let emojiProperties = [ ];
    for (let emojiProperty of extraData.emojiProperties)
    {
        if ((parseInt (emojiProperty.first, 16) <= index) && (index <= parseInt (emojiProperty.last, 16)))
        {
            emojiProperties.push (emojiProperty.name);
        }
    }
    if (emojiProperties.length > 0)
    {
        characterData.emojiProperties = emojiProperties.sort ((a, b) => a.localeCompare (b));
    }
    for (let ideograph of extraData.equivalentUnifiedIdeographs)
    {
        if ((parseInt (ideograph.first, 16) <= index) && (index <= parseInt (ideograph.last, 16)))
        {
            characterData.equivalentUnifiedIdeograph = uniHexify (ideograph.equivalent);
            break;
        }
    }
    for (let eastAsianWidth of extraData.eastAsianWidths)
    {
        if ((parseInt (eastAsianWidth.first, 16) <= index) && (index <= parseInt (eastAsianWidth.last, 16)))
        {
            characterData.eastAsianWidth = eastAsianWidths[eastAsianWidth.width];
            break;
        }
    }
    for (let verticalOrientation of extraData.verticalOrientations)
    {
        if ((parseInt (verticalOrientation.first, 16) <= index) && (index <= parseInt (verticalOrientation.last, 16)))
        {
            characterData.verticalOrientation = verticalOrientations[verticalOrientation.orientation];
            break;
        }
    }
    for (let lineBreak of extraData.lineBreaks)
    {
        if ((parseInt (lineBreak.first, 16) <= index) && (index <= parseInt (lineBreak.last, 16)))
        {
            characterData.lineBreak = lineBreaks[lineBreak.property];
            break;
        }
    }
    for (let positionalCategory of extraData.indicPositionalCategories)
    {
        if ((parseInt (positionalCategory.first, 16) <= index) && (index <= parseInt (positionalCategory.last, 16)))
        {
            characterData.indicPositionalCategory = positionalCategory.property;
            break;
        }
    }
    for (let syllabicCategory of extraData.indicSyllabicCategories)
    {
        if ((parseInt (syllabicCategory.first, 16) <= index) && (index <= parseInt (syllabicCategory.last, 16)))
        {
            characterData.indicSyllabicCategory = syllabicCategory.property;
            break;
        }
    }
    let codePoints = unicodeData;
    if (codePoint in codePoints)
    {
        let data = codePoints[codePoint];
        characterData.name = data.name;
        characterData.alias = data.alias;
        characterData.alternate = data.alternate;
        characterData.control = data.control;
        characterData.figment = data.figment;
        characterData.abbreviation = data.abbreviation;
        characterData.correction = data.correction;
        characterData.category = categories[data.category];
        characterData.combining = combiningClasses[data.combining];
        characterData.bidi = bidiClasses[data.bidi];
        characterData.decomposition = uniHexify (data.decomposition);
        characterData.standardizedVariation = data.standardizedVariation && uniHexify (data.standardizedVariation);
        characterData.decimal = data.decimal;
        characterData.digit = data.digit;
        characterData.numeric = data.numeric;
        characterData.mirrored = mirrored[data.mirrored];
        characterData.comment = data.comment;
        characterData.uppercase = uniHexify (data.uppercase);
        characterData.lowercase = uniHexify (data.lowercase);
        characterData.titlecase = uniHexify (data.titlecase);
        characterData.foldings = data.foldings && data.foldings.map (folding => uniHexify (folding));
        characterData.joiningType = data.joiningType;
        characterData.joiningGroup = data.joiningGroup;
    }
    return characterData;
}
//
function getCharactersData (characters)
{
    let dataList = [ ];
    for (let character of characters)
    {
        dataList.push (getCharacterData (character));
    }
    return dataList;
}
//
function charactersToCodePoints (characters, delimited)
{
    let codePoints = [ ];
    for (let character of characters)
    {
        codePoints.push (characterToCodePoint (character));
    }
    return (delimited) ? codePoints.map (codePoint => codePoint + " ").join ("") : codePoints.join (" ");
}
//
function codePointsToCharacters (codePoints)
{
    let characters = "";
    codePoints = codePoints.replace (/\b([0-9a-fA-F]{4,})\b/g, "U+$1");
    const regex = /\\u([0-9a-fA-F]{4})|\\u\{([0-9a-fA-F]{1,})\}|[Uu]\+?([0-9a-fA-F]{4,})|0x([0-9a-fA-F]{1,})|&#x([0-9a-fA-F]{1,});|\\x\{([0-9a-fA-F]{1,})\}/g;    // Global flag /g *must* be set!
    let code;
    while ((code = regex.exec (codePoints)))
    {
        let index = parseInt (code[1] || code[2] || code[3] || code[4] || code[5] || code[6], 16);
        if (index <= 0x10FFFF)
        {
            characters += String.fromCodePoint (index);
        }
    }
    return characters;
}
//
function findCharactersByName (regex)
{
    let characterList = [ ];
    let codePoints = unicodeData;
    for (let codePoint in codePoints)
    {
        let data = codePoints[codePoint];
        let names = [ ];
        for (let name of [ data.name, data.alias, data.alternate, data.control, data.figment, data.abbreviation, data.correction ])
        {
            if (name)
            {
                if (Array.isArray (name))
                {
                    names = names.concat (name);
                }
                else
                {
                    names.push (name);
                }
            }
        }
        for (let name of names)
        {
            if (name.match (regex))
            {
                characterList.push (String.fromCodePoint (parseInt (data.code, 16)));
                break;
            }
        }
    }
    return characterList;
}
//
function findCharactersByMatch (regex, matchDecomposition)
{
    let characterList = [ ];
    let codePoints = unicodeData;
    for (let codePoint in codePoints)
    {
        let data = codePoints[codePoint];
        let character = String.fromCodePoint (parseInt (data.code, 16));
        if (regex.test (character))
        {
            characterList.push (character);
        }
        else if (matchDecomposition && data && data.decomposition)
        {
            let codes = data.decomposition.trim ().split (" ").filter (code => (code[0] !== "<"));
            let decomposition = codes.map (code => String.fromCodePoint (parseInt (code, 16))).join ("");
            let matchStrings =
            [
                decomposition,
                decomposition.normalize ('NFC'),
                decomposition.normalize ('NFD'),
                decomposition.normalize ('NFKC'),
                decomposition.normalize ('NFKD'),
                character.normalize ('NFC'),
                character.normalize ('NFD'),
                character.normalize ('NFKC'),
                character.normalize ('NFKD')
            ];
            matchStrings = matchStrings.filter (string => (string !== character)); // Remove character itself
            matchStrings = [...new Set (matchStrings)]; // Remove duplicates
            if (matchStrings.some (string => string.match (regex)))
            {
                characterList.push (character);
            }
        }
    }
    return characterList;
}
//
function getCharacterBasicData (character)
{
    let characterBasicData = { };
    let codePoint = characterToCodePoint (character);
    characterBasicData.character = character;
    characterBasicData.codePoint = codePoint;
    let codePoints = unicodeData;
    if (codePoint in codePoints)
    {
        let data = codePoints[codePoint];
        characterBasicData.name = data.name;
        characterBasicData.alias = data.alias;
        characterBasicData.alternate = data.alternate;
        characterBasicData.control = data.control;
        characterBasicData.figment = data.figment;
        characterBasicData.abbreviation = data.abbreviation;
        characterBasicData.correction = data.correction;
        characterBasicData.category = categories[data.category];
        characterBasicData.standardizedVariation = data.standardizedVariation && uniHexify (data.standardizedVariation);
    }
    let index = character.codePointAt (0);
    for (let block of extraData.blocks)
    {
        if ((parseInt (block.first, 16) <= index) && (index <= parseInt (block.last, 16)))
        {
            characterBasicData.blockName = block.name;
            characterBasicData.blockRange = uniHexify (block.first + ".." + block.last);
            break;
        }
    }
    for (let version of extraData.versions)
    {
        if ((parseInt (version.first, 16) <= index) && (index <= parseInt (version.last, 16)))
        {
            characterBasicData.age = version.age;
            characterBasicData.ageDate = versionDates[version.age] || "Date Unknown";
            break;
        }
    }
    for (let script of extraData.scripts)
    {
        if ((parseInt (script.first, 16) <= index) && (index <= parseInt (script.last, 16)))
        {
            characterBasicData.script = script.name;
            break;
        }
    }
    for (let scriptExtension of extraData.scriptExtensions)
    {
        if ((parseInt (scriptExtension.first, 16) <= index) && (index <= parseInt (scriptExtension.last, 16)))
        {
            let names = scriptExtension.aliases.split (" ").map (alias => scripts[alias]);
            characterBasicData.scriptExtensions = names.sort ((a, b) => a.localeCompare (b));
            break;
        }
    }
    return characterBasicData;
}
//
function matchEastAsianWidth (character, widthArray)
{
    let match = false;
    let index = character.codePointAt (0);
    for (let eastAsianWidth of extraData.eastAsianWidths)
    {
        if ((parseInt (eastAsianWidth.first, 16) <= index) && (index <= parseInt (eastAsianWidth.last, 16)))
        {
            if (widthArray.includes (eastAsianWidth.width))
            {
                match = true;
                break;
            }
        }
    }
    return match;
}

function matchVerticalOrientation (character, orientationArray)
{
    let match = false;
    let index = character.codePointAt (0);
    for (let verticalOrientation of extraData.verticalOrientations)
    {
        if ((parseInt (verticalOrientation.first, 16) <= index) && (index <= parseInt (verticalOrientation.last, 16)))
        {
            if (orientationArray.includes (verticalOrientation.orientation))
            {
                match = true;
                break;
            }
        }
    }
    return match;
}
//
module.exports =
{
    characterCount,
    getCharacterData,
    getCharactersData,
    characterToCodePoint,
    charactersToCodePoints,
    codePointsToCharacters,
    findCharactersByName,
    findCharactersByMatch,
    getCharacterBasicData,
    matchEastAsianWidth,
    matchVerticalOrientation
};
//
