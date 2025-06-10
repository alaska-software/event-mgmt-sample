//////////////////////////////////////////////////////////////////////
//
//  ALASKA-SOFTWARE.WEBUI.JS
//
//  Copyright:
//   Alaska Software, (c) 2016-2023. All rights reserved.         
//  
//  Contents:
//   Declarative binding for Xbase++ Web applications
//   
//////////////////////////////////////////////////////////////////////


function webuiLog(cTxt){
  if(window.console){
    console.log( cTxt );
  }
}

function webuiError(){
  var i,cTxt;
  cTxt = arguments[0];
  for(i=1;i<arguments.length;i++){
      cTxt = cTxt.replace('$'+i.toString(),arguments[i]);
  }
  webuiLog("webui-runtime-error: "+cTxt);
}

function webuiWriteCookie(name, value, days){
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}

function webuiReadCookie(name){
  var nameEQ = escape(name) + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
  }
  return null;
}

function _webuiLocaleContent(oThis){
  var cLocale
  cLocale = webuiReadCookie("CxcUserLocale");
  if(cLocale==null || cLocale=="null"){
    cLocale = webuiReadCookie("CxcDefaultUserLocale");
    if(cLocale==null){
      cLocale = 'en';
    }
    webuiWriteCookie("CxcUserLocale", cLocale );
  }
  if(cLocale==null){
   cLocale = 'en';
  }
  oThis.html( cLocale.toUpperCase() )
}

function webuiUpdateLocale(oNode){
  var aClients
  var i
  aClients = $('span.locale',oNode)
  if(aClients.length>0){
      for(i=0;i<aClients.length;i++){
          _webuiLocaleContent($(aClients.get(i)) );
      }
  }
}

function webuiInitialize(oNode){
  var aClients;
  var cAction
  var oClient;
  var b,c;

  $('a.back',oNode).click(function(){ parent.history.back(); return false; });

  webuiUpdateLocale();

  aClients = $("a[data-action]",oNode);
  if(aClients.length>0){
    for(i=0;i<aClients.length;i++){
      oClient = $(aClients.get(i));
      cAction = oClient.attr("data-action");
      if(cAction=="setlocale"){
        oClient.click( function(){
          var _locale;
          _locale = $(this).attr("data-parameter");
          webuiWriteCookie("CxcUserLocale",_locale);
          webuiUpdateLocale();
          location.reload();
          return false;
        });
        continue;
      }
      if(cAction=="remove"){
        oClient.click( function(){
          var _target;
          _target = $(this).attr("data-target");
          $("#"+_target).remove();
          return true;
        });
        continue;
      }
      oClient.click( function(){ return _webuiHandleActionContentChange($(this)); } );
     }
  }

  $("input[data-show]",oNode).click( function(){ return _webuiShow($(this)); } );
  $("input[data-hide]",oNode).click( function(){ return _webuiHide($(this)); } );
  $("a[data-toggle]",oNode).click( function(){ return _webuiToggle($(this)); } );
  $("input[data-action][type='checkbox']",oNode).click( function(){ return _webuiHandleActionContentChange($(this)); } );
  $("input[data-toggle][type='checkbox']",oNode).click( function(){ return _webuiToggle($(this)); } );
  $("input[data-toggle][type='radio']",oNode).click( function(){ return _webuiToggle($(this)); } );
  $("button[data-action]",oNode).click( function(){ return _webuiHandleActionContentChange($(this)); } );
  $("tr[data-action]",oNode).click( function(){ return _webuiHandleActionContentChange($(this)); } );
  $("a[data-target]:not(a[data-action])",oNode).click( function(){ return _webuiHandleLinkContentChange($(this)); } );
  $("a[data-css-target]:not(a[data-action])",oNode).click( function(){ return _webuiHandleLinkCssChange($(this)); } );

  $("div[data-action]",oNode).not('[data-interval]').not('[data-delay]').click( function(){
          return _webuiHandleActionContentChange($(this));
      }
      );

  aClients = $("select[data-action]",oNode);
  if(aClients.length>0){
      for(i=0;i<aClients.length;i++){
         oClient = $(aClients.get(i));
         cAction = oClient.attr("data-action");
         if(cAction.substr(0,7)=="change:"){
           cAction = cAction.substr(7);
           oClient.attr("data-action",cAction);
           oClient.change( function(){ return _webuiHandleActionContentChange($(this)); } );
         }else
           oClient.click( function(){ return _webuiHandleActionContentChange($(this)); } );
      }
  }

  aClients = $("div[data-action][data-interval]",oNode);
  if(aClients.length>0){
      for(i=0;i<aClients.length;i++){
          _webuiHandleIntervalContentChange($(aClients.get(i)) );
      }
  }

  aClients = $("div[data-action][data-delay]",oNode);
  if(aClients.length>0){
      for(i=0;i<aClients.length;i++){
          if($(aClients.get(i)).attr('data-css-target')!=null){
            _webuiHandleDelayedCssChange($(aClients.get(i)) );
          }else{
            _webuiHandleDelayedContentChange($(aClients.get(i)) );
          }
      }
  }
}

function _webuiGetExtendUrl(oThis,cAttr){
  var _url, _pos;
  _url = oThis.attr(cAttr);
  if(_url=='#'){
    _url = oThis.attr("data-action");
  }
  /*
   * removed as there is right now no way
   * to handle that in a elegant way
  _pos = _url.indexOf('/');
  if(_pos!=-1){
      _pos = _url.indexOf('.',_pos);
      if(_pos==-1) _url += ".cxp";
  }else{
      _pos = _url.indexOf('.');
      if(_pos==-1) _url += ".cxp";
  }
  */
  return(_url);
}

function _webuiGetTargetId(oThis){
    var _dst;
    _dst = oThis.attr("data-target");
    if(_dst!=null && _dst.length>0 ) return('#'+_dst);

    _dst = oThis.attr("data-css-target");
    if(_dst!=null && _dst.length>0) return('#'+_dst);

    _dst = oThis.attr("id");
    if(_dst!=null && _dst.length>0) return('#'+_dst);

    return('');
}


function _webuiHandleLinkContentChange(oThis){
    var _url, _dst, _src, _para, _valid;

  _url  = _webuiGetExtendUrl(oThis,"href");
  _dst  = _webuiGetTargetId(oThis);
  _src  = oThis.attr("data-fragment");
  _para = oThis.attr("data-parameter");
  _valid= oThis.attr("data-validate");

  _webuiLoadContent(_dst, _url, _src, _para, _valid );
  return true;
}

function _webuiHandleLinkCssChange(oThis){
  var _url, _dst, _para, _valid;

  _url = _webuiGetExtendUrl(oThis, "href");
  _para = oThis.attr("data-parameter");
  _dst = _webuiGetTargetId(oThis);
  _valid = oThis.attr("data-validate");

  _webuiLoadCSS(_dst, _url, _para, _valid );
  return false;
}

function _webuiLoadCSS(cDest, cUrl, cPara, cValid ){
  var _verb;

  // process optional form validation
  if( cValid!=null ) {
    var fn = window[cValid];

    if( (typeof fn === 'function') && (!fn()) ) {
      return;
    }
  }

  // parameter defines POST/GET verb
  if(cPara!=null) _verb = 'POST'; else _verb = 'GET';

  // process ajax call. return value is one or two css classnames
  $.ajax({
    url: cUrl,
    type: _verb,
    data: { parameter: cPara },
    success: function(text) {
      var words = text.split(' ');

      if(words.length==1){
          $(cDest).addClass(words[0]);
      }else if(words.length==2){
          $(cDest).removeClass(words[0]);
          $(cDest).addClass(words[1]);
      }
          }
      });
}

// returns hit or last pos in string
function _scanNext(str,pos,tok){
  for(var k = pos; k < str.length && str.charAt(k)!=tok; k++);
  return(k);
}

function _isWhitespace(ch){
  return((ch == ' ') || (ch == '\t') || (ch == '\n'));
}

function isSymbol(aChar){
  return(isAlpha(aChar) || aChar[0]=="_" || isDigit(aChar));
}

function isAlnum(aChar){
  return (isDigit(aChar) || isAlpha(aChar));
}

function isDigit(aChar){
  myCharCode = aChar.charCodeAt(0);
  if((myCharCode > 47) && (myCharCode <  58)){
    return(true);
  }
  return(false);
}

function isAlpha(aChar){
  myCharCode = aChar.charCodeAt(0);
  if(((myCharCode > 64) && (myCharCode <  91)) ||
     ((myCharCode > 96) && (myCharCode < 123)) ){
     return(true);
  }
  return false;
}

function _nextToken(oS){

  if(oS.nW>=oS.cParaL.length) return(false);
  while( oS.nW<oS.cParaL.length && _isWhitespace( oS.cParaL[oS.nW] )) oS.nW++;
  if(oS.nW>=oS.cParaL.length) return(false);

  nS = oS.nW;

  if(oS.cParaL[oS.nW]==";"){
    oS.cTok = ";";
    oS.nTyp = 1;
    oS.nW++;
    return(true);
  }
  if(oS.cParaL[oS.nW]==","){
    oS.cTok = ",";
    oS.nTyp = 2;
    oS.nW++;
    return(true);
  }
  if(oS.cParaL[oS.nW]=="="){
    oS.cTok = "=";
    oS.nTyp = 3;
    oS.nW++;
    return(true);
  }

  if(isSymbol(oS.cParaL[oS.nW])){
    nS = oS.nW;
    while( oS.nW<oS.cParaL.length && isSymbol(oS.cParaL[oS.nW])) oS.nW++;
    oS.cTok = oS.cPara.substr(nS,oS.nW-nS);
    oS.nTyp = 4; // symbol
    return(true);
  }

  if(oS.cParaL[oS.nW]=="'"){
    nS = oS.nW;
    oS.nW++;
    while( oS.nW<oS.cParaL.length && oS.cParaL[oS.nW]!="'" ) oS.nW++;
    oS.nW++;
    oS.cTok = oS.cPara.substr(nS+1,(oS.nW-nS)-2);
    oS.nTyp = 5; // literal
    return(true);
  }
  if(oS.cParaL[oS.nW]=='"'){
    nS = oS.nW;
    oS.nW++;
    while( oS.nW<oS.cParaL.length && oS.cParaL[oS.nW]!='"') oS.nW++;
    oS.nW++;
    oS.cTok = oS.cPara.substr(nS+1,(oS.nW-nS)-2);
    oS.nTyp = 5; // literal
    return(true);
  }
  return(false);
}


function _AddToFieldList(aFields, _symbol, _value, _state){
  var xValue;

  if(_symbol==null) return(null);

  switch(_state){
    case 4:{ // symbol - add value of other field
      //xValue = $( "[name='"+_value+"']" ).val();
      xValue = $( "[name='"+_symbol+"']" ).val();
      aFields.push( {name: _symbol, value: encodeURIComponent(xValue) } );
      break;
    }
    case 5:{ // literal - add value or empty value
      if(_value!=null){
        aFields.push( {name: _symbol, value: encodeURIComponent(_value ) } );
      }else
        aFields.push( {name: _symbol, value: null } );

      break;
    }
    default:
      // error
  }

  return(null);
}

function _webuiDecodeParameters(cPara){
  var xForm,xParams;
  var i,j;
  var cForm,aFields,aAll;
  var oState;
  var _pos;
  var _symbol, _value, _state;

  cForm  = "";
  aFields= [];
  cParaL = cPara.toLowerCase();
  oState = { nW:0, cParaL: cPara.toLowerCase(), cPara:cPara, cTok: "", nTyp: 0 };
  for(oState.nW = 0; oState.nW < cPara.length && _isWhitespace(cPara.charAt(oState.nW)); oState.nW++);

  if( (oState.cParaL.substr(oState.nW,7)=="fields:") || (oState.cParaL.substr(oState.nW,5)=="form:") ){

    while(oState.nW<oState.cParaL.length){

     // extract
     // field:field,field,field="value"[;]
     if(oState.cParaL.substr(oState.nW,7)=="fields:"){
       oState.nW += 7;
       while( _nextToken(oState)){

         // ende
         if(oState.nTyp==1){ // ";"
           break;
         }
         if(oState.nTyp==2){ // ","

           // add current to param array
           _AddToFieldList(aFields, _symbol, _value, _state);
           _symbol = "";
           _value  = null;
           _state  = 0;
           continue;
         }
         if(oState.nTyp==3){ // "="
           // aquire value
           _nextToken(oState)
           _value = oState.cTok;
           _state = oState.nTyp;
           continue;
         }
         if(oState.nTyp==4){ // "s" symbol
           _symbol = oState.cTok;
           _state  = oState.nTyp;
           continue;
         }
       }

     }

     // extraxt
     // form:formname[;]
     if(oState.cParaL.substr(oState.nW,5)=="form:"){
       oState.nW+=5;
       _pos = oState.cParaL.indexOf(';',oState.nW);
       if(_pos>-1){
         cForm = cPara.substr(oState.nW,_pos-oState.nW);
         oState.nW = _pos+1;
       } else {
         cForm = cPara.substr(oState.nW);
         oState.nW = oState.cParaL.length;
       }
       continue;
     }

    }

    _AddToFieldList(aFields, _symbol, _value, _state);

    if(cForm.length==0){
      // syntax error we need form
    }

    // we have params
    if(aFields.length>0){
      xForm   = $('#'+cForm);
      aAll    = xForm.serializeArray();
      xParams = [];
      for(i=0;i<aFields.length;i++){

        if(aFields[i].value==null){
          for(j=0;j<aAll.length;j++){
            if(aFields[i].name.toLowerCase()==aAll[j].name.toLowerCase()) xParams.push(aAll[j]);
          }
        }else{
          xParams.push(aFields[i]);
        }
      }

      xParams = $.param(xParams);

    // just the form
    }else{
      xForm = $('#'+cForm);
      xParams = xForm.serialize();
    }

  }else{
    xParams = { parameter: cPara };
  }

  return(xParams);
}

function _webuiLoadContent(cDest,cUrl,cFragment,cPara, cValid){
  var xParams;
  var _verb;

  // process optional form validation
  if( cValid!=null ) {
    var fn = window[cValid];

    if( (typeof fn === 'function') && (!fn()) ) {
      return;
    }
  }

  if(cPara!=null) xParams = _webuiDecodeParameters(cPara);

  /* maybe somebody has parameters fixed in the url as well as
   * used the data-parameter attr. In such cases we need to merge
   * parameters.
   */
  if(cUrl!=null && cUrl.indexOf('?')!=-1 ){
    xParams = cUrl.substr( cUrl.indexOf('?')+1 ) + "&" + xParams;
    cUrl = cUrl.substr( 0, cUrl.indexOf('?') );
  }

  /* no destination given means we load the page */
  if(cDest.length==0){
    if(xParams!=null && xParams.length!=0){
      cUrl = cUrl + "?" + xParams;
    }
    window.location.href = cUrl;
    webuiInitialize( );
    return;
  }

  // parameter defines POST/GET verb
  if(cPara!=null) _verb = 'POST'; else _verb = 'GET';

  $.ajax({
    url: cUrl,
    type: _verb,
    data: xParams,
    success: function(text) {
              var data;
              if(cFragment!=null){
                  cFragment = '#'+cFragment;
                  data = $(text).filter(cFragment);
                  if(data.length>0)
                      data = data[0].innerHTML;
                  else{
                      webuiError("data-fragment(id:$1) not found in response from url($2)",cFragment,cUrl);
                  }
              }else{
                  data = text;
              }
              if(cDest.length==0){
                document.open();
                document.write(data);
                document.close();
                webuiInitialize();
              }else{
                if(!(cDest=="##")){
                   $(cDest).html(data);
                   webuiInitialize( $(cDest) );
                }
              }
          }
      });
      return;
}

function _webuiHandleActionContentChange(oThis){
  var _url, _dst, _src, _para, _ret, _valid, _lOk;

  _url = _webuiGetExtendUrl(oThis,"data-action");

  _dst = _webuiGetTargetId(oThis);
  _src = oThis.attr("data-fragment");
  _para = oThis.attr("data-parameter");
  _valid= oThis.attr("data-validate");

  _lOk = true;
  _txt =oThis.attr("data-confirm");
  if(_txt!=null) _lOk = confirm(_txt);

  if(_lOk) _webuiLoadContent(_dst, _url, _src, _para, _valid );

  /* no destination given means event is bubbling */
  if(_dst=="##") return true;

  /* we need bubbling for input controls
   * FIXME: Clarify which input type require that
   */
  if($(oThis).is('input') && $(oThis).attr('type')=='checkbox') return(true);

  // never bubble - execution stops here
  return false;
}


function _webuiHandleIntervalContentChange(oThis){
  var _url, _dst, _src, _para, _freq, _action, _valid;

  _url  = _webuiGetExtendUrl(oThis,"data-action");
  _dst  = _webuiGetTargetId(oThis);
  _src  = oThis.attr("data-fragment");
  _para = oThis.attr("data-parameter");
  _freq = oThis.attr("data-interval");
  _valid= oThis.attr("data-validate");

  _action = function(){ _webuiLoadContent(_dst, _url, _src, _para, _valid); };
  setInterval( _action, _freq );
  return false;
}

function _webuiHandleDelayedCssChange(oThis){
  var _url, _dst, _para, _delay, _action, _valid;

  _url  = _webuiGetExtendUrl(oThis,"data-action");
  _dst  = _webuiGetTargetId(oThis);
  _para = oThis.attr("data-parameter");
  _delay= oThis.attr("data-delay");
  _valid= oThis.attr("data-validate");

  _action = function(){ _webuiLoadCSS(_dst, _url, _para, _valid ); };

  setTimeout( _action, _delay );
}

function _webuiHandleDelayedContentChange(oThis){
  var _url, _dst, _src, _para, _delay, _action;

  _url  = _webuiGetExtendUrl(oThis,"data-action");
  _dst  = _webuiGetTargetId(oThis);
  _src  = oThis.attr("data-fragment");
  _para = oThis.attr("data-parameter");
  _delay= oThis.attr("data-delay");
  _valid= oThis.attr("data-validate");

  _action = function(){ _webuiLoadContent(_dst, _url, _src, _para, _valid ); };

  setTimeout( _action, _delay );
}

/* web ui declarative toggle */
function _webuiToggle(oThis){
  var _dst;
  _dst = oThis.attr("data-toggle");
  $("#"+_dst).toggle();
}

function _webuiShow(oThis){
  var _dst;
  _dst = oThis.attr("data-show");
  $("#"+_dst).show();
}
function _webuiHide(oThis){
  var _dst;
  _dst = oThis.attr("data-hide");
  $("#"+_dst).hide();
}


/* busy indicator
 */
function webuiBusyStart(text){

                if(jQuery('body').find('#resultLoading').attr('id') != 'resultLoading'){
                jQuery('body').append('<div id="resultLoading" style="display:none"><div><img src="/assets/images/busy-indicator-circle.gif"><div>'+text+'</div></div><div class="bg"></div></div>');
                }

                jQuery('#resultLoading').css({
                        'width':'100%',
                        'height':'100%',
                        'position':'fixed',
                        'z-index':'10000000',
                        'top':'0',
                        'left':'0',
                        'right':'0',
                        'bottom':'0',
                        'margin':'auto'
                });

                jQuery('#resultLoading .bg').css({
                        'background':'#000000',
                        'opacity':'0.7',
                        'width':'100%',
                        'height':'100%',
                        'position':'absolute',
                        'top':'0'
                });

                jQuery('#resultLoading>div:first').css({
                        'width': '250px',
                        'height':'75px',
                        'text-align': 'center',
                        'position': 'fixed',
                        'top':'0',
                        'left':'0',
                        'right':'0',
                        'bottom':'0',
                        'margin':'auto',
                        'font-size':'16px',
                        'z-index':'10',
                        'color':'#ffffff'

                });

            jQuery('#resultLoading .bg').height('100%');
            jQuery('#resultLoading').fadeIn(300);
            jQuery('body').css('cursor', 'wait');
        }

function webuiBusyStop(){
            jQuery('#resultLoading .bg').height('100%');
            jQuery('#resultLoading').fadeOut(300);
            jQuery('body').css('cursor', 'default');
}

/* helpers from old website */

function resizeTextArea(txtBox){
 var   nCols = txtBox.cols;
 var    sVal = txtBox.value;
 var    nVal = sVal.length;
 var nRowCnt = 1;

 for (i=0;i<nVal;i++){ if (sVal.charAt(i).charCodeAt(0) == 13) { nRowCnt +=1; } }
 if (nRowCnt < (nVal / nCols)) { nRowCnt = 1 + (nVal / nCols); }
 txtBox.rows = nRowCnt+1;
}

/* used to mark a input element as changed if data has entered */
function markAsChanged(oE){
  $(oE).addClass('changed');
}
