//////////////////////////////////////////////////////////////////////
//
//  EVENT-HELPER.PRG
//
//  Copyright:
//      Alaska Software, (c) 2015-2023. All rights reserved.         
//  
//  Contents:
//      Helper functions used by the Event Management example
//   
//////////////////////////////////////////////////////////////////////


#include "Common.ch"
#include "std.ch"
#pragma library("ical-helper.lib")

REQUEST VAbstract

/// <summary>
/// Calculate full qualified pathname based on relative path from
/// application.config and application deployment directory.
/// </summary>
///<returns>full qualified path name</returns>
FUNCTION GetDataPath( oApp )
  LOCAL cDataPath
  cDataPath := oApp:AppPath + oApp:Config:Events:Path
RETURN cDataPath


/// <summary>
/// Check whether a given event is to be shown in the event list.
/// Only a certain number of events within a certain timeframe
/// are displayed by default.
/// </summary>
/// <param name="nEvents">The number of events shown already</param>
/// <param name="dStart">Start date of the event</param>
/// <param name="oApp">The application object</param>
///<returns>.T. if the event is to be shown, .F. otherwise</returns>
FUNCTION ShowEvent( nEvents, dStart, oApp )
RETURN (nEvents<=Val(oApp:config:events:showmax))                  .AND.;
       (dStart <= Val(oApp:config:events:showdaysahead) + Date())  .AND. ;
       (dStart >= Date() - Val(oApp:config:events:showdaysbefore)) 

/// <summary>
/// Create a link for opening registered mail program
/// with specified email address
/// </summary>
/// <param name="cEM">The email address</param>
/// <returns>A string with the link (href)</returns>
FUNCTION EMailLink(cEM)
RETURN('<a href="mailto:'+cEM+'">'+AllTrim(cEM)+'</a>')


/// <summary>
/// Create a link for displaying the specified resource
/// in another window or tab
/// </summary>
/// <param name="cURL">The URL of the resource</param>
/// <returns>A string with the link (href)</returns>
FUNCTION WebLink(cURL)
RETURN('<a href="'+cURL+'" target="_new">'+AllTrim(cURL)+'</a>')


/// <summary>
/// Create string with start and end date in the form:
///  <day start>. - <day end>. <month> <year>
/// </summary>
/// <param name="dStart">The start date</param>
/// <param name="dEnd">The end date</param>
/// <returns>A string with the date formatted as outlined</returns>
FUNCTION GetEventTimeFrame(dStart,dEnd)
  LOCAL cTxt
  cTxt := Str(Day(dStart))+". "
  IF(!Empty(dEnd))
    cTxt += "-" + Str(Day(dEnd)) + ". "
  ENDIF
  cTxt += CMonth( dStart ) + " " + Str( Year( dStart ), 4 )
RETURN(cTxt)


/// <summary>
/// Create human-readable string given a delimited list
/// of language codes
/// </summary>
/// <param name="cLang">String with one or more language code(s)</param>
/// <returns>A string with the human ready-readable language code(s)</returns>
FUNCTION GetLanguageCode(cLang)
  LOCAL aLang
  LOCAL cTxt := ""
  LOCAL n
  aLang := StringToArray(cLang, ";" )
  FOR n:=1 TO Len(aLang)
    cTxt += aLang[n]
    IF(n!=Len(aLang))
      cTxt += "/"
    ENDIF
  NEXT n
RETURN(cTxt)


/// <summary>
/// Create array from a delimited list of language codes
/// </summary>
/// <param name="cIn">Delimited list of language codes</param>
/// <param name="cDel">Char used as a delimiter</param>
/// <returns>An array of language codes</returns>
FUNCTION StringToArray(cIn,cDel)
  LOCAL nW
  LOCAL aRet := {}
  LOCAL nPos
  IF(!Empty(cIn) .and. cIn[-1]!=";")
    cIn += ";"
  ENDIF
  nW := 1
  DO WHILE 0!=(nPos:=AT(cDel,cIn,nW))
    AAdd( aRet , SubStr(cIn,nW, nPos-nW) )
    nW := nPos + 1
  ENDDO
RETURN(aRet)
