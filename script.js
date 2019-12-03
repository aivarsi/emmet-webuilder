var scriptexec = null;
var browser_ready = false;
var CallbackAfterCreate;
var LastReceivedText;
var LastReceivedSelStart;
var IncCmd = "";
var SendParam = "";
var autoactn;
var autoexpand = false;


function OnWebkitLoadEnd(Sender, Browser, Frame, Status, Res) {
  browser_ready = true;
  Script.TimeOut(1, CallbackAfterCreate);
}

function CreateEmmet(Callback) {
  var Created = false;

  if (scriptexec == null) {
     scriptexec = Script.CreateScriptableJsExecuter(Script.GetPath + "index.html");
     scriptexec.OnLoadEnd = &OnWebkitLoadEnd;
     scriptexec.OnConsoleMessage = &OnWebkitConsoleMessage;
     Created = true;
     CallbackAfterCreate = Callback;
     Document.Activate;
  }
  return Created;
}


function OnWebkitConsoleMessage(Sender, browser, message, source, line, Res) {
  alert(_t(line) + ":" + source + ":" + message);
}

function GetWebuilderTab() {
  var tab = chr(9);
  if (Script.Settings.TabsToSpaces) {        
    var f;
    tab = "";
    for (f = 0; f < Script.Settings.TabSize; f++) {
      tab = tab + " ";
    }
  }
  return tab;
}


function OnWebkitData(res, err) {
  var Sel;
  var tab;
  
  var json = new TScriptableJSON();
  json.Parse(res);
  var received_text = json.GetValue("text");
  var received_selstart = json.GetValue("selstart");
  var received_end = json.GetValue("selend");
  
  var text = received_text;
  LastReceivedText = received_text;
  if (Script.Settings.TabsToSpaces) {
    tab = GetWebuilderTab();
    text = Replace(text, chr(9), tab);
  }
  var fixedtext = Replace(text, "\n", chr(13) + chr(10));
  if (Editor.text != fixedtext) {
    Editor.BeginEditing;
    Editor.Text = text;    
  }
    
  Sel = Editor.Selection;
  Sel.SelStart = StrToInt(received_selstart);
  LastReceivedSelStart = Sel.SelStart;
  StartText = copy(LastReceivedText, 1, LastReceivedSelStart);
  var m = RegexMatchAll(StartText, "\n", false, matches, poses);
  if (m) {
    Sel.SelStart = Sel.SelStart + Length(matches);
  }
  m = RegexMatchAll(StartText, "[\\t]", false, matches, poses);
  if (m) {
    tab = GetWebuilderTab();
    Sel.SelStart = Sel.SelStart + (Length(matches) * (Length(tab) - 1));
  }
  Editor.Selection = Sel;
    
  Sel = Editor.Selection;
  Sel.SelLength = StrToInt(received_end) - LastReceivedSelStart;
  
  StartText = copy(LastReceivedText, LastReceivedSelStart + 1, Sel.SelLength);
  m = RegexMatchAll(StartText, "\n", false, matches, poses);
  if (m) {
    Sel.SelLength = Sel.SelLength + Length(matches);
  }
  m = RegexMatchAll(StartText, "[\\t]", false, matches, poses);
  if (m) {
    tab = GetWebuilderTab();
    Sel.SelLength = Sel.SelLength + (Length(matches) * (Length(tab) - 1));
  }
  
  Editor.Selection = Sel;
  if (Editor.IsEditing) {
    Editor.EndEditing;
  }
}

function PrepareEmmetData(request, action) {
  var SelStart;
  var SelLen;
  Editor.GetSelectionForUnixNewlines(SelStart, SelLen);
  var dt;
  if (Document.DocType == dtCSS) {
    dt = "css";
  } else {
    dt = "html";
  }
  var json = new TScriptableJSON();
  json.SetValue("request", request);
  json.SetValue("text", Editor.Text);
  json.SetValue("actionName", action);
  json.SetValue("doctype", dt);
  json.SetValue("selstart", SelStart);
  json.SetValue("sellen", SelLen);
  var s = json.stringify();
  delete json;
  return s;
}

function DoExpandAbbreviation() {
  var data = PrepareEmmetData("TEXT", "expand_abbreviation");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function ExpandAbbreviation(Sender) {
    if (!CreateEmmet(&DoExpandAbbreviation) && browser_ready) {
      DoExpandAbbreviation();
    }
}

function DoMatchTagPairOutward() {
  var data = PrepareEmmetData("TEXT", "match_pair_outward");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function MatchTagPairOutward(Sender) {
    if (!CreateEmmet(&DoMatchTagPairOutward) && browser_ready) {
      DoMatchTagPairOutward();
    }
}

function DoMatchTagPairInward() {
  var data = PrepareEmmetData("TEXT", "match_pair_inward");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function MatchTagPairInward(Sender) {
    if (!CreateEmmet(&DoMatchTagPairInward) && browser_ready) {
      DoMatchTagPairInward();
    }
}

function DoWrapWithAbbrevationDelayed() {
  var data = PrepareEmmetData("TEXT", "wrap_with_abbreviation");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function DoWrapWithAbbrevation() {
  var data = PrepareEmmetData("PARAM", SendParam);
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function WrapWithAbbrevation(Sender) {
  var param = Prompt("Enter abbrevation:", "");
  if (param != "") {
    SendParam = param;
    if (!CreateEmmet(&DoWrapWithAbbrevation) && browser_ready) {
      DoWrapWithAbbrevation();
    }
  }
}

function DoNextEditPoint() {
  var data = PrepareEmmetData("TEXT", "next_edit_point");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function NextEditPoint(Sender) {
    if (!CreateEmmet(&DoNextEditPoint) && browser_ready) {
      DoNextEditPoint();
    }
}

function DoPrevEditPoint() {
  var data = PrepareEmmetData("TEXT", "prev_edit_point");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function PrevEditPoint(Sender) {
    if (!CreateEmmet(&DoPrevEditPoint) && browser_ready) {
      DoPrevEditPoint();
    }
}

function DoSelectLine() {
  var data = PrepareEmmetData("TEXT", "select_line");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function SelectLine(Sender) {
    if (!CreateEmmet(&DoSelectLine) && browser_ready) {
      DoSelectLine();
    }
}

function DoMergeLines() {
  var data = PrepareEmmetData("TEXT", "merge_lines");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function MergeLines(Sender) {
    if (!CreateEmmet(&DoMergeLines) && browser_ready) {
      DoMergeLines();
    }
}

function DoToggleComment() {
  var data = PrepareEmmetData("TEXT", "toggle_comment");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function ToggleComment(Sender) {
    if (!CreateEmmet(&DoToggleComment) && browser_ready) {
      DoToggleComment();
    }
}

function DoSplitJoinTag() {
  var data = PrepareEmmetData("TEXT", "split_join_tag");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function SplitJoinTag(Sender) {
    if (!CreateEmmet(&DoSplitJoinTag) && browser_ready) {
      DoSplitJoinTag();
    }
}

function DoRemoveTag() {
  var data = PrepareEmmetData("TEXT", "remove_tag");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function RemoveTag(Sender) {
    if (!CreateEmmet(&DoRemoveTag) && browser_ready) {
      DoRemoveTag();
    }
}

function DoEvalMath() {
  var data = PrepareEmmetData("TEXT", "evaluate_math_expression");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function EvalMath(Sender) {
    if (!CreateEmmet(&DoEvalMath) && browser_ready) {
      DoEvalMath();
    }
}

function DoIncrement() {
  var data = PrepareEmmetData("TEXT", IncCmd);
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function IncrementBy1(Sender) {
    IncCmd = "increment_number_by_1";
    if (!CreateEmmet(&DoIncrement) && browser_ready) {
      DoIncrement();
    }
}

function DecrementBy1(Sender) {
    IncCmd = "decrement_number_by_1";
    if (!CreateEmmet(&DoIncrement) && browser_ready) {
      DoIncrement();
    }
}

function IncrementBy10(Sender) {
    IncCmd = "increment_number_by_10";
    if (!CreateEmmet(&DoIncrement) && browser_ready) {
      DoIncrement();
    }
}

function DecrementBy10(Sender) {
    IncCmd = "decrement_number_by_10";
    if (!CreateEmmet(&DoIncrement) && browser_ready) {
      DoIncrement();
    }
}

function IncrementBy01(Sender) {
    IncCmd = "increment_number_by_01";
    if (!CreateEmmet(&DoIncrement) && browser_ready) {
      DoIncrement();
    }
}

function DecrementBy01(Sender) {
    IncCmd = "decrement_number_by_01";
    if (!CreateEmmet(&DoIncrement) && browser_ready) {
      DoIncrement();
    }
}

function DoSelectNextItem() {
  var data = PrepareEmmetData("TEXT", "select_next_item");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function SelectNextItem(Sender) {
    if (!CreateEmmet(&DoSelectNextItem) && browser_ready) {
      DoSelectNextItem();
    }
}

function DoSelectPrevItem() {
  var data = PrepareEmmetData("TEXT", "select_previous_item");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function SelectPrevItem(Sender) {
    if (!CreateEmmet(&DoSelectPrevItem) && browser_ready) {
      DoSelectPrevItem();
    }
}

function DoReflectValue() {
  var data = PrepareEmmetData("TEXT", "reflect_css_value");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function ReflectValue(Sender) {
    if (!CreateEmmet(&DoReflectValue) && browser_ready) {
      DoReflectValue();
    }
}

function DoExpandAbbrevationOrTab() {
  var data = PrepareEmmetData("TEXT", "expand_abbreviation_with_tab");
  scriptexec.ExecuteJavaScriptRequest("", "", data, &OnWebkitData);
}

function ExpandAbbrevationOrTab(Sender) {
  if (!CreateEmmet(&DoExpandAbbrevationOrTab) && browser_ready) {
    DoExpandAbbrevationOrTab();
  }    
}

function OnKeydown(&key, shift) {
  if (autoexpand) {
    if (key == #9) {
      var lt = Document.CurrentCodeType;
      if ((lt == ltHTML) || (lt == ltCSS)) {
        var Sel = Editor.Selection
        if ((Sel.SelStartColReal > 0) && (Sel.SelLength == 0)) {
        
          var line = Editor.LinesAsDisplayed[Sel.SelStartLine];
          if (Sel.SelStartCol <= length(line)) {
            var ch = line[Sel.SelStartCol];
            if (RegexMatch(ch, "[\\w\\-\\$\\:@\\!%\\+]", false) == ch) {
          
              var nextch = " ";
              if (Sel.SelStartCol + 1 <= length(line)) {
                nextch = line[Sel.SelStartCol + 1];
              }
              
              if (RegexMatch(nextch, "[\\w\\-\\$\\:@\\!%\\+]", false) == "") {
            
                key = "";
                ExpandAbbrevationOrTab(null);
              }              
            }
          }      
        }
      }
    }
  }
}

function ToggleAutoExpandAbbreviation(Sender) {
  var checked = !Actions.IsChecked(autoactn);  
  Actions.SetChecked(autoactn, checked);
  if (checked) {
    Script.WriteSetting("Auto Expand", "1");
    autoexpand = true;
  } else {
    Script.WriteSetting("Auto Expand", "0");
    autoexpand = false;
  }
}

function OnInstalled() {
  if (WeBuilder.BuildNumber < 224) {
    return "A newer editor version is required for this plugin to work.";
  }
}

function OnExit() {
  if (scriptexec != null) {
    delete scriptexec;
  }
}

Script.RegisterAction("Emmet", "Expand Abbreviation", "Shift+Ctrl+E", &ExpandAbbreviation);
autoactn = Script.RegisterAction("Emmet", "Auto Expand With Tab", "", &ToggleAutoExpandAbbreviation);
Script.RegisterAction("Emmet", "Match Tag Pair (Outward)", "Ctrl+Alt+D", &MatchTagPairOutward);
Script.RegisterAction("Emmet", "Match Tag Pair (Inward)", "Shift+Ctrl+D", &MatchTagPairInward);
Script.RegisterAction("Emmet", "Wrap With Abbrevation", "Ctrl+Alt+A", &WrapWithAbbrevation);
Script.RegisterAction("Emmet", "Next Edit Point", "Ctrl+Alt+Right", &NextEditPoint);
Script.RegisterAction("Emmet", "Previous Edit Point", "Ctrl+Alt+Left", &PrevEditPoint);
Script.RegisterAction("Emmet", "Select Line", "", &SelectLine);
Script.RegisterAction("Emmet", "Merge Lines", "Shift+Ctrl+M", &MergeLines);
Script.RegisterAction("Emmet", "Toggle Comment", "Ctrl+Alt+X", &ToggleComment);
Script.RegisterAction("Emmet", "Split/Join Tag", "Shift+Ctrl+J", &SplitJoinTag);
Script.RegisterAction("Emmet", "Remove Tag", "Shift+Ctrl+K", &RemoveTag);
Script.RegisterAction("Emmet", "Evaluate Math Expression", "Shift+Ctrl+Y", &EvalMath);
Script.RegisterAction("Emmet", "Increment Number by 1", "", &IncrementBy1);
Script.RegisterAction("Emmet", "Decrement Number by 1", "", &DecrementBy1);
Script.RegisterAction("Emmet", "Increment Number by 0.1", "", &IncrementBy01);
Script.RegisterAction("Emmet", "Decrement Number by 0.1", "", &DecrementBy01);
Script.RegisterAction("Emmet", "Increment Number by 10", "", &IncrementBy10);
Script.RegisterAction("Emmet", "Decrement Number by 10", "", &DecrementBy10);
Script.RegisterAction("Emmet", "Select Next Item", "Ctrl+.", &SelectNextItem);
Script.RegisterAction("Emmet", "Select Previous Item", "Ctrl+,", &SelectPrevItem);
Script.RegisterAction("Emmet", "Reflect CSS Value", "Shift+Ctrl+B", &ReflectValue);

Script.ConnectSignal("exit", &OnExit);
Script.ConnectSignal("installed", &OnInstalled);
Script.ConnectSignal("keydown", &OnKeydown);

if (Script.ReadSetting("Auto Expand", "0") == "1") {
  autoexpand = true;
  Actions.SetChecked(autoactn, true);
}