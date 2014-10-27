var win = null;
var web = null;
var CallbackAfterCreate;
var LastReceivedText;
var LastReceivedSelStart;
var IncCmd = "";
var SendParam = "";


function OnWebkitCreated(Sender, Browser) {
  Script.TimeOut(1, &HideWindow);
}

function HideWindow(Sender) {
  win.Caption = "";
  win.Hide();
}

function OnWebkitLoadEnd(Sender, Browser, Frame, Status, Res) {
  Script.TimeOut(1, CallbackAfterCreate);
}

function CreateEmmet(Callback) {
  var Created = false;

  if (win == null) {
     win = new TForm(WeBuilder);
     win.width = 60;
     win.Height = 60;
     win.Caption = "Loading...";
     web = Script.CreateScriptableWebKit(win, Script.GetPath + "index.html", &OnWebkitCreated);
     web.Subscribe("Emmet Text", &OnWebkitData);
     web.Subscribe("Emmet SelStart", &OnWebkitData);
     web.Subscribe("Emmet SelEnd", &OnWebkitData);
     Web.OnLoadEnd = &OnWebkitLoadEnd;
     web.OnConsoleMessage = &OnWebkitConsoleMessage;
     web.Webkit.Top = 0;
     web.Webkit.Left = 0;
     web.Webkit.Width = win.ClientWidth;
     web.Webkit.Height = win.ClientHeight;
     web.Webkit.Anchors = akLeft || akRight || akTop || akBottom;
     Created = true;
     CallbackAfterCreate = Callback;
     win.Show;
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


function OnWebkitData(channel, data) {
  var Sel;
  var tab;
  
  
  if (channel == "Emmet Text") {
    var text = data;
    LastReceivedText = data;
    if (Script.Settings.TabsToSpaces) {
      tab = GetWebuilderTab();
      text = Replace(text, chr(9), tab);
    }
    var fixedtext = Replace(text, "\n", chr(13) + chr(10));
    if (Editor.text != fixedtext) {
      Editor.BeginEditing;
      Editor.Text = text;    
    }
    
  } else if (channel == "Emmet SelStart") {
    Sel = Editor.Selection;
    Sel.SelStart = StrToInt(data);
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
    
  } else if (channel == "Emmet SelEnd") {
    Sel = Editor.Selection;
    Sel.SelLength = StrToInt(data) - LastReceivedSelStart;
    
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
}

function PrepareEmmetData() {
  var SelStart;
  var SelLen;
  Editor.GetSelectionForUnixNewlines(SelStart, SelLen);
  var dt;
  if (Document.DocType == dtCSS) {
    dt = "css";
  } else {
    dt = "html";
  }
  return ":" + dt + ":" + _t(SelStart) + ":" + _t(SelLen) + ":" + Editor.Text;
}

function DoExpandAbbreviation() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "expand_abbreviation" + data);
}

function ExpandAbbreviation(Sender) {
    if (!CreateEmmet(&DoExpandAbbreviation)) {
      DoExpandAbbreviation();
    }
}

function DoMatchTagPairOutward() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "match_pair_outward" + data);
}

function MatchTagPairOutward(Sender) {
    if (!CreateEmmet(&DoMatchTagPairOutward)) {
      DoMatchTagPairOutward();
    }
}

function DoMatchTagPairInward() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "match_pair_inward" + data);
}

function MatchTagPairInward(Sender) {
    if (!CreateEmmet(&DoMatchTagPairInward)) {
      DoMatchTagPairInward();
    }
}

function DoWrapWithAbbrevationDelayed() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "wrap_with_abbreviation" + data);
}

function DoWrapWithAbbrevation() {
  web.Send("PARAM", SendParam);
  Script.TimeOut(1, &DoWrapWithAbbrevationDelayed);
}

function WrapWithAbbrevation(Sender) {
  var param = Prompt("Enter abbrevation:", "");
  if (param != "") {
    SendParam = param;
    if (!CreateEmmet(&DoWrapWithAbbrevation)) {
      DoWrapWithAbbrevation();
    }
  }
}

function DoNextEditPoint() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "next_edit_point" + data);
}

function NextEditPoint(Sender) {
    if (!CreateEmmet(&DoNextEditPoint)) {
      DoNextEditPoint();
    }
}

function DoPrevEditPoint() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "prev_edit_point" + data);
}

function PrevEditPoint(Sender) {
    if (!CreateEmmet(&DoPrevEditPoint)) {
      DoPrevEditPoint();
    }
}

function DoSelectLine() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "select_line" + data);
}

function SelectLine(Sender) {
    if (!CreateEmmet(&DoSelectLine)) {
      DoSelectLine();
    }
}

function DoMergeLines() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "merge_lines" + data);
}

function MergeLines(Sender) {
    if (!CreateEmmet(&DoMergeLines)) {
      DoMergeLines();
    }
}

function DoToggleComment() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "toggle_comment" + data);
}

function ToggleComment(Sender) {
    if (!CreateEmmet(&DoToggleComment)) {
      DoToggleComment();
    }
}

function DoSplitJoinTag() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "split_join_tag" + data);
}

function SplitJoinTag(Sender) {
    if (!CreateEmmet(&DoSplitJoinTag)) {
      DoSplitJoinTag();
    }
}

function DoRemoveTag() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "remove_tag" + data);
}

function RemoveTag(Sender) {
    if (!CreateEmmet(&DoRemoveTag)) {
      DoRemoveTag();
    }
}

function DoEvalMath() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "evaluate_math_expression" + data);
}

function EvalMath(Sender) {
    if (!CreateEmmet(&DoEvalMath)) {
      DoEvalMath();
    }
}

function DoIncrement() {
  var data = PrepareEmmetData();
  web.Send("TEXT", IncCmd + data);
}

function IncrementBy1(Sender) {
    IncCmd = "increment_number_by_1";
    if (!CreateEmmet(&DoIncrement)) {
      DoIncrement();
    }
}

function DecrementBy1(Sender) {
    IncCmd = "decrement_number_by_1";
    if (!CreateEmmet(&DoIncrement)) {
      DoIncrement();
    }
}

function IncrementBy10(Sender) {
    IncCmd = "increment_number_by_10";
    if (!CreateEmmet(&DoIncrement)) {
      DoIncrement();
    }
}

function DecrementBy10(Sender) {
    IncCmd = "decrement_number_by_10";
    if (!CreateEmmet(&DoIncrement)) {
      DoIncrement();
    }
}

function IncrementBy01(Sender) {
    IncCmd = "increment_number_by_01";
    if (!CreateEmmet(&DoIncrement)) {
      DoIncrement();
    }
}

function DecrementBy01(Sender) {
    IncCmd = "decrement_number_by_01";
    if (!CreateEmmet(&DoIncrement)) {
      DoIncrement();
    }
}

function DoSelectNextItem() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "select_next_item" + data);
}

function SelectNextItem(Sender) {
    if (!CreateEmmet(&DoSelectNextItem)) {
      DoSelectNextItem();
    }
}

function DoSelectPrevItem() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "select_previous_item" + data);
}

function SelectPrevItem(Sender) {
    if (!CreateEmmet(&DoSelectPrevItem)) {
      DoSelectPrevItem();
    }
}

function DoReflectValue() {
  var data = PrepareEmmetData();
  web.Send("TEXT", "reflect_css_value" + data);
}

function ReflectValue(Sender) {
    if (!CreateEmmet(&DoReflectValue)) {
      DoReflectValue();
    }
}

function OnInstalled() {
  if (WeBuilder.BuildNumber < 153) {
    return "A newer editor version is required for this plugin to work.";
  }
}

function OnExit() {
  if (web != null) {
    delete web;
  }
  if (win != null) {
    delete win;
  }
}

Script.RegisterAction("Emmet", "Expand Abbreviation", "Shift+Ctrl+E", &ExpandAbbreviation);
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
Script.RegisterAction("Emmet", "Increment Number by 1", "Ctrl+Up", &IncrementBy1);
Script.RegisterAction("Emmet", "Decrement Number by 1", "Ctrl+Down", &DecrementBy1);
Script.RegisterAction("Emmet", "Increment Number by 0.1", "Alt+Up", &IncrementBy01);
Script.RegisterAction("Emmet", "Decrement Number by 0.1", "Alt+Down", &DecrementBy01);
Script.RegisterAction("Emmet", "Increment Number by 10", "Ctrl+Alt+Up", &IncrementBy10);
Script.RegisterAction("Emmet", "Decrement Number by 10", "Ctrl+Alt+Down", &DecrementBy10);
Script.RegisterAction("Emmet", "Select Next Item", "Ctrl+.", &SelectNextItem);
Script.RegisterAction("Emmet", "Select Previous Item", "Ctrl+,", &SelectPrevItem);
Script.RegisterAction("Emmet", "Reflect CSS Value", "Shift+Ctrl+B", &ReflectValue);

Script.ConnectSignal("exit", &OnExit);
Script.ConnectSignal("installed", &OnInstalled);
