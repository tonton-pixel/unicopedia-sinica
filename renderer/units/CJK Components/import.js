//
const unit = document.getElementById ('cjk-components-unit');
//
const tabs = unit.querySelectorAll ('.tab-bar .tab-radio');
const tabPanes = unit.querySelectorAll ('.tab-panes .tab-pane');
const tabInfos = unit.querySelectorAll ('.tab-infos .tab-info');
//
const lookUpHistoryButton = unit.querySelector ('.look-up-ids .history-button');
const lookUpUnihanInput = unit.querySelector ('.look-up-ids .unihan-input');
const lookUpLookUpButton = unit.querySelector ('.look-up-ids .look-up-button');
const lookUpShowGraphsCheckbox = unit.querySelector ('.look-up-ids .show-graphs-checkbox');
const lookUpIdsContainer = unit.querySelector ('.look-up-ids .ids-container');
const lookUpInstructions = unit.querySelector ('.look-up-ids .instructions');
const lookUpUnencoded = unit.querySelector ('.look-up-ids .unencoded');
const lookUpUnencodedGlyphs = unit.querySelector ('.look-up-ids .glyph-list');
const lookUpReferences = unit.querySelector ('.look-up-ids .references');
const lookUpLinks = unit.querySelector ('.look-up-ids .links');
//
const lookUpUnihanHistorySize = 128;   // 0: unlimited
//
let lookUpUnihanHistory = [ ];
let lookUpUnihanHistoryIndex = -1;
let lookUpUnihanHistorySave = null;
//
let currentLookUpUnihanCharacter;
//
let parseDefaultFolderPath;
//
const parseClearButton = unit.querySelector ('.parse-ids .clear-button');
const parseSamplesButton = unit.querySelector ('.parse-ids .samples-button');
const parseCountNumber = unit.querySelector ('.parse-ids .count-number');
const parseLoadButton = unit.querySelector ('.parse-ids .load-button');
const parseSaveButton = unit.querySelector ('.parse-ids .save-button');
const parseEntryCharacter = unit.querySelector ('.parse-ids .character-input');
const parseIdsCharacters = unit.querySelector ('.parse-ids .characters-input');
const parseDisplayModeSelect = unit.querySelector ('.parse-ids .display-mode-select');
const parseGraphContainer = unit.querySelector ('.parse-ids .graph-container');
const parseInstructions = unit.querySelector ('.parse-ids .instructions');
const parseUnencoded = unit.querySelector ('.parse-ids .unencoded');
const parseUnencodedGlyphs = unit.querySelector ('.parse-ids .glyph-list');
const parseReferences = unit.querySelector ('.parse-ids .references');
const parseLinks = unit.querySelector ('.parse-ids .links');
//
let resultsDefaultFolderPath;
//
const matchSearchString = unit.querySelector ('.match-ids .search-string');
const matchSearchMessage = unit.querySelector ('.match-ids .search-message');
const matchNestedMatch = unit.querySelector ('.match-ids .nested-match');
const matchUseRegex = unit.querySelector ('.match-ids .use-regex');
const matchSearchButton = unit.querySelector ('.match-ids .search-button');
const matchResultsButton = unit.querySelector ('.match-ids .results-button');
const matchHitCount = unit.querySelector ('.match-ids .hit-count');
const matchTotalCount = unit.querySelector ('.match-ids .total-count');
const matchSearchData = unit.querySelector ('.match-ids .search-data');
const matchInstructions = unit.querySelector ('.match-ids .instructions');
const matchRegexExamples = unit.querySelector ('.match-ids .regex-examples');
const matchUnencoded = unit.querySelector ('.match-ids .unencoded');
const matchUnencodedGlyphs = unit.querySelector ('.match-ids .glyph-list');
const matchReferences = unit.querySelector ('.match-ids .references');
const matchLinks = unit.querySelector ('.match-ids .links');
//
const matchParams = { };
//
const findSearchString = unit.querySelector ('.find-by-components .search-string');
const findSearchMessage = unit.querySelector ('.find-by-components .search-message');
const findSearchButton = unit.querySelector ('.find-by-components .search-button');
const findResultsButton = unit.querySelector ('.find-by-components .results-button');
const findHitCount = unit.querySelector ('.find-by-components .hit-count');
const findTotalCount = unit.querySelector ('.find-by-components .total-count');
const findSearchData = unit.querySelector ('.find-by-components .search-data');
const findInstructions = unit.querySelector ('.find-by-components .instructions');
const findUnencoded = unit.querySelector ('.find-by-components .unencoded');
const findUnencodedGlyphs = unit.querySelector ('.find-by-components .glyph-list');
const findReferences = unit.querySelector ('.find-by-components .references');
const findLinks = unit.querySelector ('.find-by-components .links');
//
const findParams = { };
//
module.exports.start = function (context)
{
    const { clipboard, shell } = require ('electron');
    const { BrowserWindow, getCurrentWebContents, getCurrentWindow, Menu } = require ('@electron/remote');
    //
    const mainWindow = getCurrentWindow ();
    const webContents = getCurrentWebContents ();
    //
    const fs = require ('fs');
    const path = require ('path');
    //
    const fileDialogs = require ('../../lib/file-dialogs.js');
    const pullDownMenus = require ('../../lib/pull-down-menus.js');
    const sampleMenus = require ('../../lib/sample-menus.js');
    const linksList = require ('../../lib/links-list.js');
    //
    const regexp = require ('../../lib/unicode/regexp.js');
    const unicode = require ('../../lib/unicode/unicode.js');
    const unihan = require ('../../lib/unicode/unihan.js');
    const kangxiRadicals = require ('../../lib/unicode/kangxi-radicals.json');
    const { fromRadical, fromRadicalStrokes } = require ('../../lib/unicode/get-rs-strings.js');
    const { characters, unencodedComponents } = require ('../../lib/unicode/parsed-ids-data.js');
    const ids = require ('../../lib/unicode/ids.js');
    //
    const idsRefLinks = require ('./ids-ref-links.json');
    //
    let unihanCount = Object.keys (characters).length;  // No CJK compatibility ideographs
    //
    const defaultPrefs =
    {
        tabName: "",
        //
        lookupUnihanHistory: [ ],
        lookupUnihanCharacter: "",
        lookUpShowGraphsCheckbox: false,
        lookupInstructions: true,
        lookupUnencoded: false,
        lookupReferences: false,
        //
        parseDefaultFolderPath: context.defaultFolderPath,
        parseEntryCharacter: "",
        parseIdsCharacters: "",
        parseDisplayModeSelect: "",
        parseInstructions: true,
        parseUnencoded: false,
        parseReferences: false,
        //
        resultsDefaultFolderPath: context.defaultFolderPath,
        //
        matchSearchString: "",
        matchNestedMatch: false,
        matchUseRegex: false,
        matchShowCodePoints: false,
        matchPageSize: 64,
        matchInstructions: true,
        matchRegexExamples: false,
        matchUnencoded: false,
        matchReferences: false,
        //
        findSearchString: "",
        findShowCodePoints: false,
        findPageSize: 64,
        findInstructions: true,
        findUnencoded: false,
        findReferences: false
    };
    let prefs = context.getPrefs (defaultPrefs);
    //
    const textSeparator = (process.platform === 'darwin') ? "\t" : "\xA0\xA0";
    //
    let insertCharacter = (menuItem) => { webContents.insertText (menuItem.id); };
    //
    let insertMenuTemplate =
    [
        { label: "Insert Operator", submenu: [ ] },
        { type: 'separator' },
        { label: "Insert CJK Stroke", submenu: [ ] },
        { label: "Insert Radical Form", submenu: [ ] },
        { label: "Insert Specific Component", submenu: [ ] },
        { label: "Insert Unencoded Component", submenu: [ ] }
    ];
    //
    let operatorSubmenu = insertMenuTemplate[0].submenu;
    for (let operator in ids.operators)
    {
        let idcData = ids.operators[operator];
        operatorSubmenu.push
        (
            {
                label: `${operator}${textSeparator}<${unicode.characterToCodePoint (operator)}>${textSeparator}${idcData.name}`,
                id: operator,
                click: insertCharacter
            }
        );
    }
    //
    let cjkStrokeSubmenu = insertMenuTemplate[2].submenu;
    for (let cjKStroke of "㇀㇁㇂㇃㇄㇅㇆㇇㇈㇉㇊㇋㇌㇍㇎㇏㇐㇑㇒㇓㇔㇕㇖㇗㇘㇙㇚㇛㇜㇝㇞㇟㇠㇡㇢㇣")
    {
        let name = unicode.getCharacterBasicData (cjKStroke).name;
        cjkStrokeSubmenu.push
        (
            {
                label: `${cjKStroke}${textSeparator}<${unicode.characterToCodePoint (cjKStroke)}>${textSeparator}${name}`,
                id: cjKStroke,
                click: insertCharacter
            }
        );
    }
    //
    let radicalFormSubmenu = insertMenuTemplate[3].submenu;
    let lastStrokes = 0;
    for (let kangxiRadical of kangxiRadicals)
    {
        if (lastStrokes !== kangxiRadical.strokes)
        {
            radicalFormSubmenu.push
            (
                {
                    label: `◎\xA0\xA0${fromRadicalStrokes (kangxiRadical.strokes, true).replace (" ", "\u2002")}`,
                    enabled: false
                }
            );
            lastStrokes = kangxiRadical.strokes;
        }
        let number = kangxiRadical.number;
        let radical = kangxiRadical.radical;
        let unified = kangxiRadical.unified;
        let radicalForm = unified;
        let name = kangxiRadical.name;
        let info = `KangXi Rad.\xA0${number}\xA0\xA0${radical}\xA0\xA0(${name})`;
        let radicalMenu =
        {
            label: `${fromRadical (kangxiRadical.number).replace (/^(\S+)\s(\S+)\s/u, "$1\u2002$2\u2002")}`,
            submenu: [ ]
        };
        let radicalSubMenu = radicalMenu.submenu;
        radicalSubMenu.push
        (
            {
                label: `${radicalForm}${textSeparator}<${unicode.characterToCodePoint (radicalForm)}>${textSeparator}${info}`,
                id: radicalForm,
                click: insertCharacter
            }
        );
        if (kangxiRadical.alternate)
        {
            radicalForm = kangxiRadical.alternate;
            radicalSubMenu.push
            (
                {
                    label: `${radicalForm}${textSeparator}<${unicode.characterToCodePoint (radicalForm)}>${textSeparator}${info}${textSeparator}※`,
                    id: radicalForm,
                    click: insertCharacter
                }
            );
        }
        if ("cjk" in kangxiRadical)
        {
            radicalSubMenu.push ({ type: 'separator' });
            let cjkRadicals = kangxiRadical.cjk;
            for (let cjkRadical of cjkRadicals)
            {
                let radical = cjkRadical.radical;
                let radicalForm;
                if (cjkRadical.unified === unified)
                {
                    if (cjkRadical.substitute)
                    {
                        radicalForm = cjkRadical.substitute;
                    }
                    else
                    {
                        radicalForm = radical;
                    }
                }
                else
                {
                    radicalForm = cjkRadical.unified;
                }
                let info = `CJK Rad.\xA0${number}\xA0\xA0${radical}\xA0\xA0(${cjkRadical.name})`;
                radicalSubMenu.push
                (
                    {
                        label: `${radicalForm}${textSeparator}<${unicode.characterToCodePoint (radicalForm)}>${textSeparator}${info}`,
                        id: radicalForm,
                        click: insertCharacter
                    }
                );
                if (cjkRadical.alternate)
                {
                    radicalForm = cjkRadical.alternate;
                    radicalSubMenu.push
                    (
                        {
                            label: `${radicalForm}${textSeparator}<${unicode.characterToCodePoint (radicalForm)}>${textSeparator}${info}${textSeparator}※`,
                            id: radicalForm,
                            click: insertCharacter
                        }
                    );
                }
            }
        }
        radicalFormSubmenu.push (radicalMenu);
    }
    //
    const specificComponentsTable = require ('./specific-components.json');
    //
    let specificComponentSubmenu = insertMenuTemplate[4].submenu;
    for (let specificComponentsKey in specificComponentsTable)
    {
        let specificComponentsValue = specificComponentsTable[specificComponentsKey];
        if (specificComponentsValue)
        {
            let keySubmenu = [ ];
            specificComponentSubmenu.push ({ label: specificComponentsKey, submenu: keySubmenu });
            let specificComponents = [...new Set (Array.from (specificComponentsValue))].sort ();
            for (let specificComponent of specificComponents)
            {
                keySubmenu.push
                (
                    {
                        label: `${specificComponent}${textSeparator}<${unicode.characterToCodePoint (specificComponent)}>`,
                        id: specificComponent,
                        click: insertCharacter
                    }
                );
            }
        }
    }
    //
    let unencodedSubmenu = insertMenuTemplate[5].submenu;
    for (let character in unencodedComponents)
    {
        let value = unencodedComponents[character];
        unencodedSubmenu.push
        (
            {
                label: `<${unicode.characterToCodePoint (character)}>${textSeparator}${value.number}\xA0${value.comment}`,
                id: character,
                click: insertCharacter
            }
        );
    }
    //
    let insertContextualMenu = Menu.buildFromTemplate (insertMenuTemplate);
    insertMenuTemplate[0].enabled = false;
    let insertOperandsContextualMenu = Menu.buildFromTemplate (insertMenuTemplate);
    //
    function createGlyphList ()
    {
        let list = document.createElement ('div');
        for (let character in unencodedComponents)
        {
            let value = unencodedComponents[character];
            let glyph = document.createElement ('span')
            glyph.className = 'glyph';
            glyph.textContent = character;
            glyph.title = `<${unicode.characterToCodePoint (character)}>\n${value.number}\xA0${value.comment}`;
            list.appendChild (glyph);
        }
        return list;
    }
    //
    function updateTab (tabName)
    {
        let foundIndex = 0;
        tabs.forEach
        (
            (tab, index) =>
            {
                let match = (tab.parentElement.textContent === tabName);
                if (match)
                {
                    foundIndex = index;
                }
                else
                {
                    tab.checked = false;
                    tabPanes[index].hidden = true;
                    tabInfos[index].hidden = true;
                }
            }
        );
        tabs[foundIndex].checked = true;
        tabPanes[foundIndex].hidden = false;
        tabInfos[foundIndex].hidden = false;
    }
    //
    updateTab (prefs.tabName);
    //
    for (let tab of tabs)
    {
        tab.addEventListener ('click', (event) => { updateTab (event.currentTarget.parentElement.textContent); });
    }
    //
    function clearSearch (data)
    {
        while (data.firstChild)
        {
            data.firstChild.remove ();
        }
    }
    //
    function getNameTooltip (character)
    {
        let tooltip = Array.from (character).map
        (
            char =>
            {
                let data = unicode.getCharacterBasicData (char);
                return `<${data.codePoint}>\xA0${(data.name === "<control>") ? data.alias : data.name}`;
            }
        ).join (",\n");
        if (character in unencodedComponents)
        {
            let value = unencodedComponents[character];
            tooltip += `\n${value.number}\xA0${value.comment}`;
        }
        return tooltip;
    }
    //
    const explicitSources =
    {
        "G": "China",
        "H": "Hong Kong",
        "J": "Japan",
        "K": "South Korea",
        "M": "Macao",
        "P": "North Korea",
        "T": "Taiwan",
        "V": "Vietnam",
        //
        "B": "U.K.",
        "S": "SAT",
        "U": "UTC",
        //
        "UCS2003": "UCS2003",
        //
        "X": "(Alternative)",
        "Z": "(Unifiable)"
    };
    //
    // https://github.com/mdaines/viz.js/wiki/Usage
    // https://github.com/mdaines/viz.js/wiki/Caveats
    //
    const Viz = require ('viz.js');
    const { Module, render } = require ('viz.js/full.render.js');
    //
    let viz = new Viz ({ Module, render });
    //
    const dotTemplate = fs.readFileSync (path.join (__dirname, 'template.dot'), { encoding: 'utf8' });
    //
    function getFontFamily (fontFamily)
    {
        return getComputedStyle (document.body).getPropertyValue (fontFamily).replaceAll ("\"", "").trim ();
    }
    function getFontFamilyString (fontFamily)
    {
        return JSON.stringify (getFontFamily (fontFamily));
    }
    const idsFamilyString = getFontFamilyString ('--ids-family');
    //
    function postProcessSVG (svg)
    {
        let doc = parser.parseFromString (svg, 'text/xml');
        let ellipses = doc.documentElement.querySelectorAll ('.node ellipse');
        for (let ellipse of ellipses)
        {
            // Customize dashed style
            let strokeDasharray = ellipse.getAttribute ('stroke-dasharray')
            if (strokeDasharray === '5,2')  // style = dashed
            {
                ellipse.setAttribute ('stroke-dasharray', '3.333,1.667');
                ellipse.setAttribute ('stroke-dashoffset', '1.667');
                ellipse.setAttribute ('stroke-width', '1.5');
            }
            // Fix incorrect centering of text in ellipses (circles)
            let cx = ellipse.getAttribute ('cx');
            let texts = ellipse.parentNode.querySelectorAll ('text');
            for (let text of texts)
            {
                let textAnchor = text.getAttribute ('text-anchor');
                if (textAnchor !== "middle")
                {
                    text.setAttribute ('text-anchor', "middle");
                    text.setAttribute ('x', cx);
                }
            }
            if (texts.length === 1)
            {
                let text = texts[0];
                let y = parseFloat (text.getAttribute ('y'));
                text.setAttribute ('y', y + 2); // Empirical adjustment
            }
        }
        let polygons = doc.documentElement.querySelectorAll ('.node polygon');
        for (let polygon of polygons)
        {
            // Customize dashed style
            let strokeDasharray = polygon.getAttribute ('stroke-dasharray')
            if (strokeDasharray === '5,2')  // style = dashed
            {
                polygon.setAttribute ('stroke-dasharray', '3.333,1.667');
                polygon.setAttribute ('stroke-dashoffset', '1.667');
                polygon.setAttribute ('stroke-width', '1.5');
            }
            // Fix incorrect centering of text in polygons (squares)
            let texts = polygon.parentNode.querySelectorAll ('text');
            if (texts.length === 1)
            {
                let text = texts[0];
                let y = parseFloat (text.getAttribute ('y'));
                text.setAttribute ('y', y + 2); // Empirical adjustment
           }
        }
        let paths = doc.documentElement.querySelectorAll ('.edge path');
        for (let path of paths)
        {
            // Customize dotted style
            let strokeDasharray = path.getAttribute ('stroke-dasharray')
            if (strokeDasharray === '1,5')  // style = dotted
            {
                path.setAttribute ('stroke-dasharray', '1.5,1.5');
                path.setAttribute ('stroke-dashoffset', '1');
            }
        }
        // Remove unwanted tooltips
        let tooltips = doc.documentElement.querySelectorAll ('.edge title, .node title');
        for (let tooltip of tooltips)
        {
            let lineBreak = tooltip.nextSibling;
            if (lineBreak && (lineBreak.nodeType === 3) && (lineBreak.nodeValue.match (/\r?\n/)))
            {
                lineBreak.remove ();
            }
            tooltip.remove ();
        }
        return serializer.serializeToString (doc);
    }
    //
    let parser = new DOMParser ();
    let serializer = new XMLSerializer ();
    //
    let defaultFontColor = '#000000';
    let errorFontColor = '#CC0000';
    //
    function treeToGraphData (entry, tree, excessGraphemes, displayMode)
    {
        let dummy = document.createElement ('span');
        dummy.style.setProperty ('color', getComputedStyle(document.body).getPropertyValue ('--color-accent'));
        let rgbColor = dummy.style.getPropertyValue ('color');
        dummy.remove ();
        let unencodedFontColor = '#' + rgbColor.match (/\b\d+\b/gui).map (component => parseInt (component).toString (16).padStart (2, "0")).join ('');
        // console.log (require ('../../lib/json2.js').stringify (tree, null, 4));
        let data = "";
        let nodeIndex = 0;
        if (entry)
        {
            let fontColor = (/^\p{Private_Use}$/u.test (entry)) ? unencodedFontColor : defaultFontColor;
            let style = regexp.isUnihanVariation (entry) ? "filled, dashed": "filled";
            data += `    n${nodeIndex++} [ label = ${JSON.stringify (entry)}, shape = circle, width = 0.75, fontsize = 36, fillcolor = "#F7F7F7", fontcolor = "${fontColor}", style = "filled", style = "${style}", tooltip = ${JSON.stringify (getNameTooltip (entry))} ]\n`;
        }
        else
        {
            nodeIndex++;
        }
        if (excessGraphemes && (displayMode === 'LR'))
        {
            data += `    subgraph\n`;
            data += `    {\n`;
            let excessNodes = [ ];
            excessNodes.push (`n${nodeIndex + excessGraphemes.length}`);
            data += `        n${nodeIndex + excessGraphemes.length} -> n${nodeIndex} [ style = "invis" ]\n`;
            for (let index = nodeIndex; index <= excessGraphemes.length ; index++)
            {
                excessNodes.push (`n${index}`);
            }
            data += `        { rank = same; ${excessNodes.join ('; ')} }\n`;
            for (let excessCharacter of excessGraphemes)
            {
                let currentNodeIndex = nodeIndex;
                data += `        n${nodeIndex++} [ label = ${JSON.stringify (excessCharacter)}, tooltip = ${JSON.stringify (getNameTooltip (excessCharacter))}, color = "${errorFontColor}", fontcolor = "${errorFontColor}", style = "bold" ]\n`;
                if (nodeIndex <= excessGraphemes.length)
                {
                    data += `        n${currentNodeIndex} -> n${nodeIndex} [ style = "invis" ]\n`;
                }
            }
            data += `    }\n`;
        }
        function walkTree (tree)
        {
            if (typeof tree === 'string')
            {
                let fontColor = (/^\p{Private_Use}$/u.test (tree)) ? unencodedFontColor : defaultFontColor;
                let style = regexp.isUnihanVariation (tree) ? "filled, dashed": "filled";
                data += `    n${nodeIndex++} [ label = ${JSON.stringify (tree)}, fillcolor = "#F7F7F7", fontcolor = "${fontColor}", style = "${style}", tooltip = ${JSON.stringify (getNameTooltip (tree))} ]\n`;
            }
            else if (typeof tree === 'object')
            {
                if (tree === null)
                {
                    data += `    n${nodeIndex++} [ style = invis ]\n`;
                }
                else
                {
                    if ('operator' in tree)
                    {
                        let currentNodeIndex = nodeIndex;
                        data += `    n${nodeIndex++} [ label = "${tree.operator}", tooltip = ${JSON.stringify (getNameTooltip (tree.operator))} ]\n`;
                        for (let index = 0; index < tree.operands.length; index++)
                        {
                            if (tree.operands[index])
                            {
                                data += `    n${currentNodeIndex} -> n${nodeIndex}\n`;
                            }
                            else
                            {
                                data += `    n${currentNodeIndex} -> n${nodeIndex} [ color = "${errorFontColor}" ]\n`;
                            }
                            walkTree (tree.operands[index]);
                        }
                    }
                }
            }
        }
        if (entry)
        {
            data += `    n${0} -> n${nodeIndex} [ arrowhead = none, style = "dashed" ]\n`;
            // data += `    n${0} -> n${nodeIndex} [ arrowhead = none, style = "dotted" ]\n`;
        }
        walkTree (tree);
        if (excessGraphemes && (displayMode === 'TB'))
        {
            data += `    subgraph\n`;
            data += `    {\n`;
            let excessNodes = [ ];
            excessNodes.push (`n${1}`);
            for (let excessCharacter of excessGraphemes)
            {
                excessNodes.push (`n${nodeIndex}`);
                data += `        n${nodeIndex++} [ label = ${JSON.stringify (excessCharacter)}, tooltip = ${JSON.stringify (getNameTooltip (excessCharacter))}, color = "${errorFontColor}", fontcolor = "${errorFontColor}", style = "bold" ]\n`;
            }
            data += `        { rank = same; ${excessNodes.join ('; ')} }\n`;
            data += `    }\n`;
        }
        return data;
    }
    //
    function isCharacterInIDSData (character, IDSData)
    {
        let result = false;
        for (let sequence of IDSData.sequences)
        {
            let ids = sequence.ids;
            if ((ids.indexOf ("⊖") === -1) && (ids.indexOf (character) !== -1)) // Hack!!
            {
                result = true;
                break;
            }
        }
        return result;
    }
    //
    const doubleClickNavigation = false;
    //
    function createIDSTable (unihanCharacter, IDSCharacters, IDSSource, showGraph, asList)
    {
        let table = document.createElement ('table');
        table.className = 'wrapper';
        if (showGraph)
        {
            table.classList.add ('graph');
        }
        let sourceRow = document.createElement ('tr');
        sourceRow.className = 'source-row';
        let sourceLabel = document.createElement ('td');
        sourceLabel.className = 'source-label';
        sourceLabel.textContent = (asList) ? "●\xA0Source:" : "Source:";
        sourceRow.appendChild (sourceLabel);
        let sourceGap = document.createElement ('td');
        sourceGap.className = 'source-gap';
        sourceRow.appendChild (sourceGap);
        let sourceData = document.createElement ('td');
        sourceData.className = 'source-data';
        if (IDSSource)
        {
            let sources;
            if (IDSSource === "UCS2003")
            {
                sources = [ IDSSource ];
            }
            else
            {
                sources = Array.from (IDSSource.replace (/\[.*\]$/, string => string.slice (1, -1).toLowerCase ()));
            }
            for (let source of sources)
            {
                let span = document.createElement ('span');
                span.className = 'source';
                if (/[a-z]/.test (source))  // Is lower case
                {
                    span.classList.add ('extra');
                    source = source.toUpperCase ();
                }
                else
                {
                    span.classList.add ('normal');
                }
                span.textContent = source;
                let tooltip = explicitSources[source];
                if (tooltip)
                {
                    span.title = tooltip;
                }
                sourceData.appendChild (span);
            }
        }
        sourceRow.appendChild (sourceData);
        table.appendChild (sourceRow);
        let rowGap = document.createElement ('tr');
        rowGap.className = 'row-gap';
        table.appendChild (rowGap);
        if (!showGraph)
        {
            let characters = document.createElement ('tr');
            characters.className = 'characters';
            let character = document.createElement ('td');
            character.className = 'character';
            character.title = getNameTooltip (unihanCharacter);
            character.textContent = unihanCharacter;
            characters.appendChild (character);
            let characterGap = document.createElement ('td');
            characterGap.className = 'gap';
            characters.appendChild (characterGap);
            let idsCharacters = document.createElement ('td');
            idsCharacters.className = 'ids-characters';
            if (IDSCharacters)
            {
                for (let IDScharacter of IDSCharacters)
                {
                    let symbol = document.createElement ('span');
                    symbol.className = 'symbol';
                    if (IDScharacter in unencodedComponents)
                    {
                        symbol.classList.add ('unencoded');
                    }
                    symbol.title = getNameTooltip (IDScharacter);
                    symbol.textContent = IDScharacter;
                    idsCharacters.appendChild (symbol);
                }
            }
            characters.appendChild (idsCharacters);
            table.appendChild (characters);
            table.appendChild (rowGap.cloneNode ());
            let codePoints = document.createElement ('tr');
            codePoints.className = 'code-points';
            let codePoint = document.createElement ('td');
            codePoint.className = 'code-point';
            codePoint.title = unihan.getTooltip (unihanCharacter);
            codePoint.textContent = unicode.characterToCodePoint (unihanCharacter);
            codePoints.appendChild (codePoint);
            codepointGap = document.createElement ('td');
            codepointGap.className = 'gap';
            codePoints.appendChild (codepointGap);
            let idsCodePoints = document.createElement ('td');
            idsCodePoints.className = 'ids-code-points';
            if (IDSCharacters)
            {
                idsCodePoints.textContent = unicode.charactersToCodePoints (IDSCharacters);
            }
            codePoints.appendChild (idsCodePoints);
            table.appendChild (codePoints);
        }
        else
        {
            let graphRow = document.createElement ('tr');
            graphRow.className = 'graph-row';
            let graphData = document.createElement ('td');
            graphData.className = 'graph-data';
            graphData.colSpan = 3;
            let graphContainer = document.createElement ('div');
            graphContainer.className = 'graph-container';
            let data = treeToGraphData (unihanCharacter, ids.getTree (Array.from (IDSCharacters)), null, 'LR');
            let dotString =
                dotTemplate
                .replace ('{{rankdir}}', 'LR')
                .replace ('{{fontname}}', idsFamilyString)
                .replace ('{{data}}', data);
            // console.log (dotString);
            try
            {
                viz.renderString (dotString, { engine: 'dot', format: 'svg' })
                .then
                (
                    result =>
                    {
                        svgResult = postProcessSVG (result);
                        graphContainer.innerHTML = svgResult;
                        let aTags = graphContainer.querySelectorAll ('a');
                        for (let aTag of aTags)
                        {
                            if (doubleClickNavigation)
                            {
                                aTag.classList.add ('no-link');
                            }
                            else
                            {
                                let character = aTag.querySelector ('text').textContent;
                                if (!regexp.isUnified (character))
                                {
                                    aTag.classList.add ('no-link');
                                }
                            }
                        }
                    }
                );
            }
            catch (e)
            {
            }
            graphData.appendChild (graphContainer);
            graphContainer.addEventListener
            (
                doubleClickNavigation ? 'dblclick' : 'click',
                (event) =>
                {
                    let aTag = event.target.closest ('a');
                    if (aTag)
                    {
                        event.preventDefault ();
                        let character = aTag.querySelector ('text').textContent;
                        if (character === unihanCharacter)
                        {
                            let historyLength = lookUpUnihanHistory.length;
                            if (historyLength > 1)
                            {
                                for (let index = 1; index < historyLength; index++)
                                {
                                    let historyCharacter = lookUpUnihanHistory[index];
                                    if (isCharacterInIDSData (unihanCharacter, characters[historyCharacter]))
                                    {
                                        updateLookUpUnihanData (historyCharacter);
                                        break;
                                    }
                                }
                            }
                        }
                        else if (regexp.isUnified (character))
                        {
                            updateLookUpUnihanData (character);
                        }
                    }
                }
            );
            graphRow.appendChild (graphData);
            table.appendChild (graphRow);
        }
        return table;
    }
    //
    function getTooltip (character)
    {
        let data = unicode.getCharacterBasicData (character);
        return `${data.codePoint.replace (/U\+/, "U\u034F\+")}\xA0${character}` + (regexp.isRadical (character) ? " (Radical)" : ""); // U+034F COMBINING GRAPHEME JOINER
    }
    function onLinkClick (event)
    {
        updateLookUpUnihanData (event.currentTarget.dataset.char);
    }
    //
    const codePointOrCharacterPattern = '\\b(U\\+[0-9a-fA-F]{4,5})\\b|(.)';
    const codePointOrCharacterRegex = new RegExp (codePointOrCharacterPattern, 'gu');
    //
    function appendTextWithLinks (node, text)
    {
        let matches = text.matchAll (codePointOrCharacterRegex);
        let clickables = [ ];
        for (let match of matches)
        {
            let matched = match[0];
            let index = match.index;
            let lastIndex = index + matched.length;
            let codePoint;
            let char;
            if (match[1])
            {
                codePoint = matched.toUpperCase ();
                char = String.fromCodePoint (parseInt (codePoint.replace ("U+", ""), 16));
                if (regexp.isUnihan (char) || regexp.isRadical (char))
                {
                    clickables.push ({ type: 'code-point', matched, index, lastIndex, codePoint, char });
                }
            }
            else if (match[2])
            {
                char = matched;
                if (regexp.isUnihan (char) || regexp.isRadical (char))
                {
                    codePoint = unicode.characterToCodePoint (char);
                    clickables.push ({ type: 'char', matched, index, lastIndex, codePoint, char });
                }
            }
        }
        for (let index = clickables.length - 2; index >= 0; index--)
        {
            let current = clickables[index];
            let next = clickables[index + 1];
            if ((current.char === next.char) && (current.type !== next.type) && (text.slice (current.lastIndex, next.index) === " "))
            {
                // Merge into current
                current.type = 'combo';
                current.matched = `${current.matched} ${next.matched}`;
                current.index = current.index;
                current.lastIndex = next.lastIndex;
                // Remove next
                clickables.splice (index + 1, 1);
            }
        }
        let lastIndex = 0;
        for (clickable of clickables)
        {
            node.appendChild (document.createTextNode (text.slice (lastIndex, clickable.index)));
            lastIndex = clickable.lastIndex;
            link = document.createElement ('span');
            link.className = 'unihan-character-link';
            if (clickable.char != currentLookUpUnihanCharacter)
            {
                link.classList.add ('clickable');
                link.dataset.char = clickable.char;
                link.addEventListener ('click', onLinkClick);
            }
            link.textContent = clickable.matched;
            link.title = getTooltip (clickable.char);
            node.appendChild (link);
        }
        node.appendChild (document.createTextNode (text.slice (lastIndex, text.length)));
    }
    //
    function createIDSNotes (notes)
    {
        let table = document.createElement ('table');
        table.className = 'notes';
        let notesRow = document.createElement ('tr');
        notesRow.className = 'notes-row';
        let notesLabel = document.createElement ('td');
        notesLabel.className = 'notes-label';
        notesLabel.textContent = "Notes:";
        notesRow.appendChild (notesLabel);
        // let notesGap = document.createElement ('td');
        // notesGap.className = 'notes-gap';
        // notesRow.appendChild (notesGap);
        let notesData = document.createElement ('td');
        notesData.className = 'notes-data';
        appendTextWithLinks (notesData, notes);
        notesRow.appendChild (notesData);
        table.appendChild (notesRow);
        return table;
    }
    //
    lookUpUnihanHistory = prefs.lookupUnihanHistory;
    //
    function displayLookUpData (unihanCharacter)
    {
        while (lookUpIdsContainer.firstChild)
        {
            lookUpIdsContainer.firstChild.remove ();
        }
        currentLookUpUnihanCharacter = unihanCharacter;
        if (unihanCharacter)
        {
            let indexOfUnihanCharacter = lookUpUnihanHistory.indexOf (unihanCharacter);
            if (indexOfUnihanCharacter !== -1)
            {
                lookUpUnihanHistory.splice (indexOfUnihanCharacter, 1);
            }
            lookUpUnihanHistory.unshift (unihanCharacter);
            if ((lookUpUnihanHistorySize > 0) && (lookUpUnihanHistory.length > lookUpUnihanHistorySize))
            {
                lookUpUnihanHistory.pop ();
            }
            lookUpUnihanHistoryIndex = -1;
            lookUpUnihanHistorySave = null;
            //
            let data = characters[unihanCharacter];
            if (data)
            {
                for (let sequence of data.sequences)
                {
                    lookUpIdsContainer.appendChild (createIDSTable (unihanCharacter, sequence.ids, sequence.source, lookUpShowGraphsCheckbox.checked, data.sequences.length > 1));
                }
                if (data.notes)
                {
                    lookUpIdsContainer.appendChild (createIDSNotes (data.notes.trim ()));
                }
            }
        }
    }
    //
    const characterOrCodePointRegex = /^\s*(?:(.)[\u{FE00}-\u{FE0F}\u{E0100}-\u{E01EF}]?|(?:[Uu]\+?)?([0-9a-fA-F]{4,8}))\s*$/u;
    //
    function validateUnihanCharacter (inputString)
    {
        let character = "";
        let match = inputString.match (characterOrCodePointRegex);
        if (match)
        {
            if (match[1])
            {
                character = match[1];
            }
            else if (match[2])
            {
                character = String.fromCodePoint (parseInt (match[2], 16));
            }
            if (!regexp.isUnified (character))
            {
                character = "";
            }
        }
        return character;
    }
    //
    lookUpUnihanInput.addEventListener
    (
        'input',
        (event) =>
        {
            event.currentTarget.classList.remove ('invalid');
            if (event.currentTarget.value)
            {
                if (!validateUnihanCharacter (event.currentTarget.value))
                {
                    event.currentTarget.classList.add ('invalid');
                }
            }
        }
    );
    lookUpUnihanInput.addEventListener
    (
        'keypress',
        (event) =>
        {
            if (event.key === 'Enter')
            {
                event.preventDefault ();
                lookUpLookUpButton.click ();
            }
        }
    );
    lookUpUnihanInput.addEventListener
    (
        'keydown',
        (event) =>
        {
            if (event.altKey)
            {
                if (event.key === 'ArrowUp')
                {
                    event.preventDefault ();
                    if (lookUpUnihanHistoryIndex === -1)
                    {
                        lookUpUnihanHistorySave = event.currentTarget.value;
                    }
                    lookUpUnihanHistoryIndex++;
                    if (lookUpUnihanHistoryIndex > (lookUpUnihanHistory.length - 1))
                    {
                        lookUpUnihanHistoryIndex = (lookUpUnihanHistory.length - 1);
                    }
                    if (lookUpUnihanHistoryIndex !== -1)
                    {
                        event.currentTarget.value = lookUpUnihanHistory[lookUpUnihanHistoryIndex];
                        event.currentTarget.dispatchEvent (new Event ('input'));
                    }
                }
                else if (event.key === 'ArrowDown')
                {
                    event.preventDefault ();
                    lookUpUnihanHistoryIndex--;
                    if (lookUpUnihanHistoryIndex < -1)
                    {
                        lookUpUnihanHistoryIndex = -1;
                        lookUpUnihanHistorySave = null;
                    }
                    if (lookUpUnihanHistoryIndex === -1)
                    {
                        if (lookUpUnihanHistorySave !== null)
                        {
                            event.currentTarget.value = lookUpUnihanHistorySave;
                            event.currentTarget.dispatchEvent (new Event ('input'));
                        }
                    }
                    else
                    {
                        event.currentTarget.value = lookUpUnihanHistory[lookUpUnihanHistoryIndex];
                        event.currentTarget.dispatchEvent (new Event ('input'));
                    }
                }
            }
        }
    );
    //
    function updateLookUpUnihanData (character)
    {
        lookUpUnihanInput.value = "";
        lookUpUnihanInput.blur ();
        lookUpUnihanInput.dispatchEvent (new Event ('input'));
        displayLookUpData (character);
        unit.scrollTop = 0;
        unit.scrollLeft = 0;
    }
    //
    lookUpLookUpButton.addEventListener
    (
        'click',
        (event) =>
        {
            if (lookUpUnihanInput.value)
            {
                let character = validateUnihanCharacter (lookUpUnihanInput.value);
                if (character)
                {
                    updateLookUpUnihanData (character);
                }
                else
                {
                    shell.beep ();
                }
            }
            else
            {
                lookUpUnihanHistoryIndex = -1;
                lookUpUnihanHistorySave = null;
                updateLookUpUnihanData ("");
            }
        }
    );
    //
    function insertUnihanCharacter (menuItem)
    {
        lookUpUnihanInput.value = menuItem.id;
        lookUpUnihanInput.dispatchEvent (new Event ('input'));
        lookUpLookUpButton.click ();
    };
    lookUpHistoryButton.addEventListener
    (
        'click',
        (event) =>
        {
            let historyMenuTemplate = [ ];
            historyMenuTemplate.push ({ label: "Lookup History", enabled: false })
            // historyMenuTemplate.push ({ type: 'separator' })
            if (lookUpUnihanHistory.length > 0)
            {
                for (let unihan of lookUpUnihanHistory)
                {
                    historyMenuTemplate.push
                    (
                        {
                            label: `${unihan}${textSeparator}${unicode.characterToCodePoint (unihan)}`,
                            id: unihan,
                            toolTip: unicode.getCharacterBasicData (unihan).name,
                            click: insertUnihanCharacter
                        }
                    );
                }
            }
            else
            {
                historyMenuTemplate.push ({ label: "(no history yet)", enabled: false });
            }
            let historyContextualMenu = Menu.buildFromTemplate (historyMenuTemplate);
            pullDownMenus.popup (event.currentTarget, historyContextualMenu, 0);
        }
    );
    //
    lookUpShowGraphsCheckbox.checked = prefs.lookUpShowGraphsCheckbox;
    lookUpShowGraphsCheckbox.addEventListener
    (
        'input',
        (event) => displayLookUpData (currentLookUpUnihanCharacter)
    );
    //
    currentLookUpUnihanCharacter = prefs.lookupUnihanCharacter;
    updateLookUpUnihanData (currentLookUpUnihanCharacter);
    //
    lookUpInstructions.open = prefs.lookupInstructions;
    //
    lookUpUnencoded.open = prefs.lookupUnencoded;
    //
    lookUpUnencodedGlyphs.appendChild (createGlyphList ());
    //
    lookUpReferences.open = prefs.lookupReferences;
    //
    linksList (lookUpLinks, idsRefLinks);
    //
    parseDefaultFolderPath = prefs.parseDefaultFolderPath;
    //
    const parseEntryIDSpattern = /^([^\t]*)\t([^\t]*)/u;
    //
    parseClearButton.addEventListener
    (
        'click',
        (event) =>
        {
            parseEntryCharacter.value = "";
            parseIdsCharacters.value = "";
            parseEntryCharacter.focus ();
            parseIdsCharacters.dispatchEvent (new Event ('input'));
        }
    );
    //
    const parseSamples = require ('./parse-samples.json');
    //
    let parseTextMenu = sampleMenus.makeMenu
    (
        parseSamples,
        (sample) =>
        {
            let entry;
            let ids;
            let found = sample.string.match (parseEntryIDSpattern);
            if (found)
            {
                entry = found[1];
                ids = found[2];
            }
            else
            {
                entry = "";
                ids = sample.string;
            }
            parseEntryCharacter.value = entry;
            parseIdsCharacters.value = ids;
            parseIdsCharacters.dispatchEvent (new Event ('input'));
        }
    );
    //
    parseSamplesButton.addEventListener
    (
        'click',
        event =>
        {
            pullDownMenus.popup (event.currentTarget, parseTextMenu);
        }
    );
    //
    parseLoadButton.addEventListener
    (
        'click',
        (event) =>
        {
            fileDialogs.loadTextFile
            (
                "Load text file:",
                [ { name: "Text (*.txt)", extensions: [ 'txt' ] } ],
                parseDefaultFolderPath,
                'utf8',
                (text, filePath) =>
                {
                    let entry;
                    let ids;
                    let found = text.match (parseEntryIDSpattern);
                    if (found)
                    {
                        entry = found[1];
                        ids = found[2];
                    }
                    else
                    {
                        entry = "";
                        ids = text;
                    }
                    parseEntryCharacter.value = entry;
                    parseIdsCharacters.value = ids;
                    parseIdsCharacters.dispatchEvent (new Event ('input'));
                    parseDefaultFolderPath = path.dirname (filePath);
                }
            );
        }
    );
    //
    parseSaveButton.addEventListener
    (
        'click',
        (event) =>
        {
            fileDialogs.saveTextFile
            (
                "Save text file:",
                [ { name: "Text (*.txt)", extensions: [ 'txt' ] } ],
                parseDefaultFolderPath,
                (filePath) =>
                {
                    let text;
                    parseDefaultFolderPath = path.dirname (filePath);
                    if (parseEntryCharacter.value)
                    {
                        text = `${parseEntryCharacter.value}\t${parseIdsCharacters.value}`;
                    }
                    else
                    {
                        text = parseIdsCharacters.value;
                    }
                    return text;
                }
            );
        }
    );
    //
    parseDisplayModeSelect.value = prefs.parseDisplayModeSelect;
    if (parseDisplayModeSelect.selectedIndex < 0) // -1: no element is selected
    {
        parseDisplayModeSelect.selectedIndex = 0;
    }
    parseDisplayModeSelect.addEventListener
    (
        'input',
        event =>
        {
            parseIdsCharacters.dispatchEvent (new Event ('input'));
        }
    );
    //
    const segmenter = new Intl.Segmenter ();    // { granularity: 'grapheme' } by default
    //
    function graphemeSplit (string)
    {
        let graphemes = [ ];
        let segments = segmenter.segment (string);
        for (let { segment } of segments)
        {
            graphemes.push (segment);
        }
        return graphemes;
    }
    //
    function displayParseData (entry, idsString)
    {
        dotString = "";
        svgResult = "";
        while (parseGraphContainer.firstChild)
        {
            parseGraphContainer.firstChild.remove ();
        }
        if (idsString)
        {
            let idsArray = graphemeSplit (idsString)
            let excessGraphemes = null;
            let delta = ids.compare (idsArray);
            if (delta > 0)
            {
                excessGraphemes = idsArray.slice (-delta);
            }
            let data = treeToGraphData (graphemeSplit (entry)[0], ids.getTree (idsArray), excessGraphemes, parseDisplayModeSelect.value);
            dotString =
                dotTemplate
                .replace ('{{rankdir}}', parseDisplayModeSelect.value)
                .replace ('{{fontname}}', idsFamilyString)
                .replace ('{{data}}', data);
            // console.log (dotString);
            try
            {
                viz.renderString (dotString, { engine: 'dot', format: 'svg' })
                .then
                (
                    result =>
                    {
                        svgResult = postProcessSVG (result);
                        parseGraphContainer.innerHTML = svgResult;
                    }
                );
            }
            catch (e)
            {
            }
        }
    }
    //
    parseEntryCharacter.addEventListener
    (
        'input',
        (event) =>
        {
            parseIdsCharacters.dispatchEvent (new Event ('input'));
        }
    );
    //
    function smartPaste (menuItem)
    {
        let text = clipboard.readText ();
        if (text)
        {
            let entry;
            let ids;
            let found = text.match (parseEntryIDSpattern);
            if (found)
            {
                entry = found[1].trim ();
                ids = found[2].replace (/^\^/, "").replace (/\$.*$/, "").trim ();
            }
            else
            {
                entry = "";
                ids = text.replace (/^\^/, "").replace (/\$.*$/, "").trim ();
            }
            setTimeout
            (
                () => 
                {
                    parseEntryCharacter.focus ();
                    webContents.selectAll ();
                    webContents.replace (entry);
                }
            );
            setTimeout
            (
                () => 
                {
                    parseIdsCharacters.focus ();
                    webContents.selectAll ();
                    webContents.replace (ids);
                    parseIdsCharacters.dispatchEvent (new Event ('input'));
                }
            );
        }
    };
    //
    let smartPasteMenuTemplate =
    [
        { label: "Smart Paste", click: smartPaste }
    ];
    let smartPasteContextualMenu = Menu.buildFromTemplate (smartPasteMenuTemplate);
    //
    parseEntryCharacter.addEventListener
    (
        'contextmenu',
        (event) =>
        {
            if (BrowserWindow.getFocusedWindow () === mainWindow)   // Should not be necessary...
            {
                event.preventDefault ();
                smartPasteContextualMenu.popup ({ window: mainWindow });
            }
        }
    );
    //
    parseIdsCharacters.addEventListener
    (
        'input',
        (event) =>
        {
            let entry = parseEntryCharacter.value;
            let idsCharacters = event.currentTarget.value;
            parseCountNumber.textContent = Array.from (idsCharacters).length;
            displayParseData (entry, idsCharacters);
        }
    );
    //
    parseEntryCharacter.value = prefs.parseEntryCharacter;
    parseIdsCharacters.value = prefs.parseIdsCharacters;
    parseIdsCharacters.dispatchEvent (new Event ('input'));
    //
    parseIdsCharacters.addEventListener
    (
        'contextmenu',
        (event) =>
        {
            if (BrowserWindow.getFocusedWindow () === mainWindow)   // Should not be necessary...
            {
                event.preventDefault ();
                insertContextualMenu.popup ({ window: mainWindow });
            }
        }
    );
    //
    parseInstructions.open = prefs.parseInstructions;
    //
    parseUnencoded.open = prefs.parseUnencoded;
    //
    parseUnencodedGlyphs.appendChild (createGlyphList ());
    //
    parseReferences.open = prefs.parseReferences;
    //
    linksList (parseLinks, idsRefLinks);
    //
    resultsDefaultFolderPath = prefs.resultsDefaultFolderPath;
    //
    const resultsDataTable = require ('./results-data-table.js');
    //
    function saveResults (string)
    {
        fileDialogs.saveTextFile
        (
            "Save text file:",
            [ { name: "Text (*.txt)", extensions: [ 'txt' ] } ],
            resultsDefaultFolderPath,
            (filePath) =>
            {
                resultsDefaultFolderPath = path.dirname (filePath);
                return string;
            }
        );
    }
    //
    matchNestedMatch.checked = prefs.matchNestedMatch;
    //
    matchUseRegex.checked = prefs.matchUseRegex;
    //
    matchParams.showCodePoints = prefs.matchShowCodePoints;
    matchParams.pageSize = prefs.matchPageSize;
    //
    matchSearchString.addEventListener
    (
        'keypress',
        (event) =>
        {
            if (event.key === 'Enter')
            {
                event.preventDefault ();
                matchSearchButton.click ();
            }
        }
    );
    matchSearchString.addEventListener
    (
        'focusin',
        (event) =>
        {
            if (event.currentTarget.classList.contains ('error'))
            {
                matchSearchMessage.classList.add ('shown');
            }
        }
    );
    matchSearchString.addEventListener
    (
        'focusout',
        (event) =>
        {
            if (event.currentTarget.classList.contains ('error'))
            {
                matchSearchMessage.classList.remove ('shown');
            }
        }
    );
    matchSearchString.addEventListener
    (
        'input',
        (event) =>
        {
            event.currentTarget.classList.remove ('error');
            matchSearchMessage.textContent = "";
            matchSearchMessage.classList.remove ('shown');
            if (matchUseRegex.checked)
            {
                try
                {
                    regexp.build (event.currentTarget.value, { useRegex: matchUseRegex.checked });
                }
                catch (e)
                {
                    event.currentTarget.classList.add ('error');
                    matchSearchMessage.textContent = e.message;
                    if (event.currentTarget === document.activeElement)
                    {
                        matchSearchMessage.classList.add ('shown');
                    }
                }
            }
        }
    );
    matchSearchString.value = prefs.matchSearchString;
    matchSearchString.dispatchEvent (new Event ('input'));
    //
    matchSearchString.addEventListener
    (
        'contextmenu',
        (event) =>
        {
            if (BrowserWindow.getFocusedWindow () === mainWindow)   // Should not be necessary...
            {
                event.preventDefault ();
                insertContextualMenu.popup ({ window: mainWindow });
            }
        }
    );
    //
    matchUseRegex.addEventListener
    (
        'change',
        (event) => matchSearchString.dispatchEvent (new Event ('input'))
    );
    //
    function testMatchCharacter (character, regex, characterCheckedList, nestedMatch)
    {
        let result = false;
        if (character in characterCheckedList)
        {
            result = characterCheckedList[character];
        }
        else
        {
            result = regex.test (character);
            if (result)
            {
                characterCheckedList[character] = true;
            }
            else
            {
                let data = characters[character];
                for (let sequence of data.sequences)
                {
                    if (regex.test (sequence.ids))
                    {
                        characterCheckedList[character] = true;
                        result = true;
                        break;
                    }
                    else
                    {
                        characterCheckedList[character] = false;
                        if (nestedMatch)
                        {
                            let nestedCharacters = sequence.ids.match (/\p{Unified_Ideograph}/gu);
                            if (nestedCharacters)
                            {
                                for (let nestedCharacter of nestedCharacters)
                                {
                                    if (nestedCharacter !== character)
                                    {
                                        result = testMatchCharacter (nestedCharacter, regex, characterCheckedList, nestedMatch);
                                        if (result)
                                        {
                                            characterCheckedList[character] = true;
                                            characterCheckedList[nestedCharacter] = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (result)
                        {
                            break;
                        }
                    }
                }
            }
        }
        return result;
    }
    //
    function findCharactersByMatch (regex, nestedMatch)
    {
        let itemArray = [ ];
        let characterCheckedList = { };
        for (let character in characters)
        {
            if (testMatchCharacter (character, regex, characterCheckedList))
            {
                itemArray.push ({ character, dimmed: false });
            }
        }
        if (nestedMatch)
        {
            let nestedCharacterCheckedList = { };
            for (let character in characters)
            {
                if (!(characterCheckedList[character]))
                {
                    if (testMatchCharacter (character, regex, nestedCharacterCheckedList, nestedMatch))
                    {
                        itemArray.push ({ character, dimmed: true });
                    }
                }
            }
        }
        return itemArray.sort ((a, b) => a.character.codePointAt (0) - b.character.codePointAt (0));
    }
    //
    function updateMatchResults (hitCount, totalCount)
    {
        matchHitCount.textContent = hitCount;
        matchTotalCount.textContent = totalCount;
        matchResultsButton.disabled = (hitCount <= 0);
    }
    //
    let currentCharactersByMatch = [ ];
    //
    matchSearchButton.addEventListener
    (
        'click',
        (event) =>
        {
            if (!matchSearchString.classList.contains ('error'))
            {
                let searchString = matchSearchString.value;
                if (searchString)
                {
                    let regex = null;
                    try
                    {
                        regex = regexp.build (searchString, { useRegex: matchUseRegex.checked });
                    }
                    catch (e)
                    {
                    }
                    if (regex)
                    {
                        clearSearch (matchSearchData);
                        let characters = [ ];
                        let items = findCharactersByMatch (regex, matchNestedMatch.checked);
                        for (let item of items)
                        {
                            characters.push (item.character);
                        };
                        currentCharactersByMatch = characters;
                        updateMatchResults (currentCharactersByMatch.length, unihanCount);
                        if (currentCharactersByMatch.length > 0)
                        {
                            matchParams.pageIndex = 0;
                            matchSearchData.appendChild (resultsDataTable.create (items, matchParams, unihan.getTooltip));
                        }
                    }
                }
            }
            else
            {
                shell.beep ();
            }
        }
    );
    //
    let matchResultsMenu =
    Menu.buildFromTemplate
    (
        [
            {
                label: "Copy Results", // "Copy Results as String"
                click: () => 
                {
                    if (currentCharactersByMatch.length > 0)
                    {
                        clipboard.writeText (currentCharactersByMatch.join (""));
                    }
                }
            },
            {
                label: "Save Results...", // "Save Results to File"
                click: () => 
                {
                    saveResults (currentCharactersByMatch.join (""));
                }
            },
            { type: 'separator' },
            {
                label: "Clear Results",
                click: () => 
                {
                    clearSearch (matchSearchData);
                    currentCharactersByMatch = [ ];
                    updateMatchResults (currentCharactersByMatch.length, unihanCount);
                }
            }
        ]
    );
    //
    matchResultsButton.addEventListener
    (
        'click',
        (event) =>
        {
            pullDownMenus.popup (event.currentTarget, matchResultsMenu);
        }
    );
    //
    updateMatchResults (currentCharactersByMatch.length, unihanCount);
    //
    matchInstructions.open = prefs.matchInstructions;
    matchRegexExamples.open = prefs.matchRegexExamples;
    //
    matchUnencoded.open = prefs.matchUnencoded;
    //
    matchUnencodedGlyphs.appendChild (createGlyphList ());
    //
    matchReferences.open = prefs.matchReferences;
    //
    linksList (matchLinks, idsRefLinks);
    //
    findParams.showCodePoints = prefs.findShowCodePoints;
    findParams.pageSize = prefs.findPageSize;
    //
    function areValidComponents (components)
    {
        let componentArray = Array.from (components).filter (character => !/\s/u.test (character));
        return componentArray.every (component => ids.isValidOperand (component));
    }
    //
    findSearchString.addEventListener
    (
        'keypress',
        (event) =>
        {
            if (event.key === 'Enter')
            {
                event.preventDefault ();
                findSearchButton.click ();
            }
        }
    );
    findSearchString.addEventListener
    (
        'focusin',
        (event) =>
        {
            if (event.currentTarget.classList.contains ('error'))
            {
                findSearchMessage.classList.add ('shown');
            }
        }
    );
    findSearchString.addEventListener
    (
        'focusout',
        (event) =>
        {
            if (event.currentTarget.classList.contains ('error'))
            {
                findSearchMessage.classList.remove ('shown');
            }
        }
    );
    findSearchString.addEventListener
    (
        'input',
        (event) =>
        {
            event.currentTarget.classList.remove ('error');
            findSearchMessage.textContent = "";
            findSearchMessage.classList.remove ('shown');
            if (!areValidComponents (event.currentTarget.value))
            {
                event.currentTarget.classList.add ('error');
                findSearchMessage.textContent = "Invalid component(s)";
                if (event.currentTarget === document.activeElement)
                {
                    findSearchMessage.classList.add ('shown');
                }
            }
        }
    );
    findSearchString.value = prefs.findSearchString;
    findSearchString.dispatchEvent (new Event ('input'));
    //
    findSearchString.addEventListener
    (
        'contextmenu',
        (event) =>
        {
            if (BrowserWindow.getFocusedWindow () === mainWindow)   // Should not be necessary...
            {
                event.preventDefault ();
                insertOperandsContextualMenu.popup ({ window: mainWindow });
            }
        }
    );
    //
    function findCharactersByComponents (components)
    {
        let itemArray = [ ];
        for (let component of components)
        {
            // Temporary!!
            if ((!/\s/u.test (component)) && regexp.isUnihan (component))
            {
                itemArray.push ({ character: component });
            }
        }
        return itemArray.sort ((a, b) => a.character.codePointAt (0) - b.character.codePointAt (0));
    }
    //
    function updateFindResults (hitCount, totalCount)
    {
        findHitCount.textContent = hitCount;
        findTotalCount.textContent = totalCount;
        findResultsButton.disabled = (hitCount <= 0);
    }
    //
    let currentCharactersByFind = [ ];
    //
    findSearchButton.addEventListener
    (
        'click',
        (event) =>
        {
            if (!findSearchString.classList.contains ('error'))
            {
                let searchString = findSearchString.value;
                if (searchString)
                {
                    clearSearch (findSearchData);
                    let characters = [ ];
                    let items = findCharactersByComponents (searchString);
                    for (let item of items)
                    {
                        characters.push (item.character);
                    };
                    currentCharactersByFind = characters;
                    updateFindResults (currentCharactersByFind.length, unihanCount);
                    if (currentCharactersByFind.length > 0)
                    {
                        findParams.pageIndex = 0;
                        findSearchData.appendChild (resultsDataTable.create (items, findParams, unihan.getTooltip));
                    }
                }
            }
            else
            {
                shell.beep ();
            }
        }
    );
    //
    let findResultsMenu =
    Menu.buildFromTemplate
    (
        [
            {
                label: "Copy Results", // "Copy Results as String"
                click: () => 
                {
                    if (currentCharactersByFind.length > 0)
                    {
                        clipboard.writeText (currentCharactersByFind.join (""));
                    }
                }
            },
            {
                label: "Save Results...", // "Save Results to File"
                click: () => 
                {
                    saveResults (currentCharactersByFind.join (""));
                }
            },
            { type: 'separator' },
            {
                label: "Clear Results",
                click: () => 
                {
                    clearSearch (findSearchData);
                    currentCharactersByFind = [ ];
                    updateFindResults (currentCharactersByFind.length, unihanCount);
                }
            }
        ]
    );
    //
    findResultsButton.addEventListener
    (
        'click',
        (event) =>
        {
            pullDownMenus.popup (event.currentTarget, findResultsMenu);
        }
    );
    //
    updateFindResults (currentCharactersByFind.length, unihanCount);
    //
    findInstructions.open = prefs.findInstructions;
    //
    findUnencoded.open = prefs.findUnencoded;
    //
    findUnencodedGlyphs.appendChild (createGlyphList ());
    //
    findReferences.open = prefs.findReferences;
    //
    linksList (findLinks, idsRefLinks);
};
//
module.exports.stop = function (context)
{
    function getCurrentTabName ()
    {
        let currentTabName = "";
        for (let tab of tabs)
        {
            if (tab.checked)
            {
                currentTabName = tab.parentElement.textContent;
                break;
            }
        }
        return currentTabName;
    }
    //
    let prefs =
    {
        tabName: getCurrentTabName (),
        //
        lookupUnihanHistory: lookUpUnihanHistory,
        lookupUnihanCharacter: currentLookUpUnihanCharacter,
        lookUpShowGraphsCheckbox: lookUpShowGraphsCheckbox.checked,
        lookupInstructions: lookUpInstructions.open,
        lookupUnencoded: lookUpUnencoded.open,
        lookupReferences: lookUpReferences.open,
        //
        parseDefaultFolderPath: parseDefaultFolderPath,
        parseEntryCharacter: parseEntryCharacter.value,
        parseIdsCharacters: parseIdsCharacters.value,
        parseDisplayModeSelect: parseDisplayModeSelect.value,
        parseInstructions: parseInstructions.open,
        parseUnencoded: parseUnencoded.open,
        parseReferences: parseReferences.open,
        //
        resultsDefaultFolderPath: resultsDefaultFolderPath,
        //
        matchSearchString: matchSearchString.value,
        matchNestedMatch: matchNestedMatch.checked,
        matchUseRegex: matchUseRegex.checked,
        matchShowCodePoints: matchParams.showCodePoints,
        matchPageSize: matchParams.pageSize,
        matchInstructions: matchInstructions.open,
        matchRegexExamples: matchRegexExamples.open,
        matchUnencoded: matchUnencoded.open,
        matchReferences: matchReferences.open,
        //
        findSearchString: findSearchString.value,
        findShowCodePoints: findParams.showCodePoints,
        findPageSize: findParams.pageSize,
        findInstructions: findInstructions.open,
        findUnencoded: findUnencoded.open,
        findReferences: findReferences.open
    };
    context.setPrefs (prefs);
};
//
