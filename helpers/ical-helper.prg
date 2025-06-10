//////////////////////////////////////////////////////////////////////
//
//  ICAL-HELPER.PRG
//
//  Copyright:
//      Alaska Software, (c) 2015-2023. All rights reserved.         
//  
//  Contents:
//      Classes for creating events in iCalendar format
//   
//  Remarks:
//      See here for more information:
//       o http://en.wikipedia.org/wiki/ICalendar#Events_.28VEVENT.29
//       o http://build.mnode.org/projects/ical4j/apidocs/net/fortuna/ical4j/model/component/VEvent.html
//   
//////////////////////////////////////////////////////////////////////


#ifdef UNIT_TEST
/// <summary>
/// Unit test for testing the VCalender class
/// <para/>
/// Compile with /dUNIT_TEST=1
/// </summary>
PROCEDURE Main
  local oC := VCalendar():New()

  oE := VEvent():New("Ninas Reiki","20140308T110000","20140308T130000")
  oC:Add(oE)
  oE := VEvent():New("WakeUp","20140308T070000")
  oC:Add(oE)

  cData := oC:toString()
  ? cData
  MemoWrit("cal.ics",cData)
  WAIT
RETURN
#endif

/// <summary>
/// Generic class for maintaining a list of attributes
/// associated with an object. The attributes and their
/// values can be retrieved as a text stream in the
/// format used with the virtual calendars (.ics files).
/// </summary>
CLASS VAbstract
  PROTECTED:
  /// <summary>Buffer with the saved attributes and their values</summary>
  VAR _Data
  /// <summary>Stack for managing the current context</summary>
  VAR _Stack
  METHOD Init()
  METHOD Reset()
  METHOD Push()
  METHOD Pop()
  METHOD Write()
  METHOD WriteCRLF()
  METHOD WriteAttribute()
  METHOD WriteTextAttribute()
  METHOD ReadData()
ENDCLASS

/// <summary>Initialize the object</summary>
METHOD VAbstract:Init()
  ::Reset()
  ::_Stack := {}
RETURN SELF

/// <summary>Reset the object</summary>
METHOD VAbstract:Reset()
  ::_Data := ""
RETURN SELF

/// <summary>Read/get saved data</summary>
METHOD VAbstract:ReadData()
RETURN ::_Data

/// <summary>Set current context for attribute store</summary>
METHOD VAbstract:Push()
  LOCAL cClass := Upper(::ClassName())
  ::WriteAttribute("begin", cClass)
  AAdd(::_Stack,cClass)
RETURN SELF

/// <summary>Restore previous context for attribute store</summary>
METHOD VAbstract:Pop()
  LOCAL nP := Len(::_Stack)
  IF(nP==0)
    RETURN SELF
  ENDIF

  ::WriteAttribute("end", ::_Stack[nP])
  ARemove( ::_Stack, nP )
RETURN SELF

/// <summary>Save an attribut in the current context</summary>
/// <para name="cKey">Name of the attribut (key value)</para>
/// <para name="cVal">String with attribute value</para>
METHOD VAbstract:WriteAttribute(cKey,cVal)
  IF(Empty(cVal))
    RETURN SELF
  ENDIF
  ::_Data += Upper(cKey)+":"+cVal
  ::WriteCRLF()
RETURN SELF

/// <summary>
/// Save an attribut as a text block in the current context
/// </summary>
/// <para name="cKey">Name of the attribut (key value)</para>
/// <para name="cVal">String with attribute value</para>
METHOD VAbstract:WriteTextAttribute(cKey,cVal)
  IF(Empty(cVal))
    RETURN SELF
  ENDIF
  cVal := StrTran( cVal, "<br>","\n")
  ::_Data += Upper(cKey)+":"+cVal
  ::WriteCRLF()
RETURN SELF

/// <summary>
/// End current line with carriage return/linefeed
/// </summary>
METHOD VAbstract:WriteCRLF()
  ::_Data += Chr(13)+Chr(10)
RETURN SELF

/// <summary>
/// Add a string to the current context
/// </summary>
METHOD VAbstract:Write(cVal)
  ::_Data += cVal
RETURN SELF


/// <summary>
/// Class for managing a virtual calendar (.ics file)
/// </summary>
CLASS VCalendar FROM VAbstract
  PROTECTED:
  VAR _Version
  VAR _Product
  VAR _Scale
  VAR _Events
  EXPORTED:
  METHOD Init()
  METHOD Add()
  METHOD ToString()
ENDCLASS

/// <summary>
/// Initialize the virtual calendar
/// </summary>
METHOD VCalendar:Init()
  SUPER
  ::_Version := "2.0"
  ::_Product := ":-//Alaska Software//Xbase++ 2.0//EN"
  ::_Scale   := "GREGORIAN"

  ::_Events    := {}
RETURN SELF

/// <summary>
/// Add an event to the virtual calendar
/// </summary>
/// <param name="oAny">Event to be added. Instance of the "VEvent" class.</param>
METHOD VCalendar:Add(oAny)
  IF(ValType(oAny)!="O")
    RETURN SELF
  ENDIF
  IF(oAny:IsDerivedFrom("VEVENT"))
    AAdd( ::_Events, oAny )
  ENDIF
RETURN SELF

/// <summary>
/// Get virtual calendar as a text stream
/// </summary>
/// <returns>String in .ics format</returns>
METHOD VCalendar:toString()
   LOCAL n
   /*
    * Write properties of the calendar and associated events to the attribute
    * store. Afterwards, retrieve contents as a string
    */
   ::Reset()
   ::Push()
   ::WriteAttribute("prodid",::_Product)
   ::WriteAttribute("version",::_Version)
   ::WriteAttribute("scale",::_Scale)
   ::WriteCRLF()
   FOR n:= 1 TO Len(::_Events)
     ::Write( ::_Events[n]:toString() )
     ::WriteCRLF()
   NEXT n
   ::Pop()
RETURN ::ReadData()


/// <summary>
/// Class for managing events in a virtual calendar (.ics file)
/// </summary>
CLASS VEvent FROM VAbstract
  PROTECTED:
  VAR _DTStart
  VAR _DTEnd
  VAR _Summary
  VAR _Description
  VAR _Location
  VAR _Priority
  VAR _Organizer
  VAR _DTStamp
  VAR _UID
  EXPORTED:
  METHOD Init()
  ACCESS ASSIGN METHOD SetStart VAR DTStart
  ACCESS ASSIGN METHOD SetEnd VAR DTEnd
  ACCESS ASSIGN METHOD SetDescription VAR Description
  ACCESS ASSIGN METHOD SetSummary VAR Summary
  ACCESS ASSIGN METHOD SetLocation VAR Location
  ACCESS ASSIGN METHOD SetPriority VAR Priority
  ACCESS ASSIGN METHOD SetOrganizer VAR Organizer
  ACCESS ASSIGN METHOD SetStamp VAR DTStamp
  ACCESS ASSIGN METHOD SetUID VAR UID
  METHOD toString()
ENDCLASS

/// <summary>
/// Initialize the event
/// </summary>
/// <param name="cSummary">Event summary</param>
/// <param name="dStart">Start date and time</param>
/// <param name="dEnd">End date and time</param>
METHOD VEvent:init(cSummary,dtStart,dtEnd)
  SUPER
  ::_UID := UuidToChar( UuidCreate() )
  IF(!Empty(cSummary))
    ::_Summary := AllTrim(cSummary)
  ENDIF
  IF(!Empty(dtStart))
    ::_DTStart := AllTrim(dtStart)
  ENDIF
  IF(!Empty(dtEnd))
    ::_DTEnd := AllTrim(dtEnd)
  ENDIF
RETURN SELF

/// <summary>
/// Set or retrieve start date and time
/// </summary>
/// <param name="xVal">New date and time</param>
/// <returns>Old date and time</returns>
METHOD VEvent:SetStart(xVal)
  IF(PCount()>0)
    ::_DTStart := xVal
  ENDIF
RETURN ::_DTStart

/// <summary>
/// Set or retrieve end date and time
/// </summary>
/// <param name="xVal">New date and time</param>
/// <returns>Old date and time</returns>
METHOD VEvent:SetEnd(xVal)
  IF(PCount()>0)
    ::_DTEnd := xVal
  ENDIF
RETURN ::_DTEnd

/// <summary>
/// Set or retrieve the description of the event
/// </summary>
/// <param name="xVal">String with the new description</param>
/// <returns>Old description as string</returns>
METHOD VEvent:SetDescription(xVal)
  IF(PCount()>0)
    ::_Description := xVal
  ENDIF
RETURN ::_Description

/// <summary>
/// Set or retrieve the description of the event
/// </summary>
/// <param name="xVal">String with the new summary</param>
/// <returns>String with the old summary</returns>
METHOD VEvent:SetSummary(xVal)
  IF(PCount()>0)
    ::_Summary := xVal
  ENDIF
RETURN ::_Summary

/// <summary>
/// Set or retrieve the location of the event
/// </summary>
/// <param name="xVal">String with the new location</param>
/// <returns>Old location as string</returns>
METHOD VEvent:SetLocation(xVal)
  IF(PCount()>0)
    ::_Location := xVal
  ENDIF
RETURN ::_Location

/// <summary>
/// Set or retrieve the priority of the event
/// </summary>
/// <remarks>
/// The priority is specified as a value from 0 to 9 (0=none, 1=highest)
/// </remarks>
/// <param name="xVal">String with the new priority</param>
/// <returns>String with the old priority</returns>
METHOD VEvent:SetPriority(xVal)
  IF(PCount()>0)
    ::_Priority := xVal
  ENDIF
RETURN ::_Priority

/// <summary>
/// Set or retrieve the organizer of the event
/// </summary>
/// <param name="xVal">String with the name of the new organizer</param>
/// <returns>String with the name of the old organizer</returns>
METHOD VEvent:SetOrganizer(xVal)
  IF(PCount()>0)
    ::_Organizer := xVal
  ENDIF
RETURN ::_Organizer

/// <summary>
/// Set or retrieve the creation date of the event
/// </summary>
/// <param name="xVal">New date an time</param>
/// <returns>Old date and time</returns>
METHOD VEvent:SetStamp(xVal)
  IF(PCount()>0)
    ::_DTStamp := xVal
  ENDIF
RETURN ::_DTStamp

/// <summary>
/// Set or retrieve the id of the event
/// </summary>
/// <param name="xVal">String with the new id (UUID)</param>
/// <returns>String with the old UUID</returns>
METHOD VEvent:SetUID(xVal)
  IF(PCount()>0)
    ::_UID := xVal
  ENDIF
RETURN ::_UID

/// <summary>
/// Get event as a text in ics format
/// </summary>
/// <returns>String in .ics format</returns>
METHOD VEvent:toString()
   /*
    * Write properties of the event to the attribute store. Afterwards,
    * retrieve contents as a string
    */
  ::Reset()
  ::Push()

  ::WriteAttribute("uid",::_UID)
  ::WriteAttribute("summary",::_Summary)

  ::WriteAttribute("dtstart",::_DTStart)
  ::WriteAttribute("dtend",::_DTEnd)
  ::WriteAttribute("dtstamp",::_DTStamp)

  ::WriteAttribute("description",::_Description)
  ::WriteTextAttribute("location",::_Location)
  ::WriteAttribute("priority",::_Priority)
  ::WriteAttribute("organizer",::_Organizer)

  ::Pop()
RETURN ::ReadData()
