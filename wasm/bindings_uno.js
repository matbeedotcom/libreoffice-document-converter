function init_unoembind_uno(instance) {
    return {
        'com': {
            'sun': {
                'star': {
                    'accessibility': {
                        'AccessibleEventObject': instance.uno_Type_com$sun$star$accessibility$AccessibleEventObject,
                        'AccessibleRelation': instance.uno_Type_com$sun$star$accessibility$AccessibleRelation,
                        'AccessibleScrollType': instance.uno_Type_com$sun$star$accessibility$AccessibleScrollType,
                        'AccessibleTableModelChange': instance.uno_Type_com$sun$star$accessibility$AccessibleTableModelChange,
                        'IllegalAccessibleComponentStateException': instance.uno_Type_com$sun$star$accessibility$IllegalAccessibleComponentStateException,
                        'TextSegment': instance.uno_Type_com$sun$star$accessibility$TextSegment,
                        'XAccessible': instance.uno_Type_com$sun$star$accessibility$XAccessible,
                        'XAccessibleAction': instance.uno_Type_com$sun$star$accessibility$XAccessibleAction,
                        'XAccessibleComponent': instance.uno_Type_com$sun$star$accessibility$XAccessibleComponent,
                        'XAccessibleContext': instance.uno_Type_com$sun$star$accessibility$XAccessibleContext,
                        'XAccessibleContext2': instance.uno_Type_com$sun$star$accessibility$XAccessibleContext2,
                        'XAccessibleContext3': instance.uno_Type_com$sun$star$accessibility$XAccessibleContext3,
                        'XAccessibleEditableText': instance.uno_Type_com$sun$star$accessibility$XAccessibleEditableText,
                        'XAccessibleEventBroadcaster': instance.uno_Type_com$sun$star$accessibility$XAccessibleEventBroadcaster,
                        'XAccessibleEventListener': instance.uno_Type_com$sun$star$accessibility$XAccessibleEventListener,
                        'XAccessibleExtendedAttributes': instance.uno_Type_com$sun$star$accessibility$XAccessibleExtendedAttributes,
                        'XAccessibleExtendedComponent': instance.uno_Type_com$sun$star$accessibility$XAccessibleExtendedComponent,
                        'XAccessibleGroupPosition': instance.uno_Type_com$sun$star$accessibility$XAccessibleGroupPosition,
                        'XAccessibleHyperlink': instance.uno_Type_com$sun$star$accessibility$XAccessibleHyperlink,
                        'XAccessibleHypertext': instance.uno_Type_com$sun$star$accessibility$XAccessibleHypertext,
                        'XAccessibleImage': instance.uno_Type_com$sun$star$accessibility$XAccessibleImage,
                        'XAccessibleKeyBinding': instance.uno_Type_com$sun$star$accessibility$XAccessibleKeyBinding,
                        'XAccessibleMultiLineText': instance.uno_Type_com$sun$star$accessibility$XAccessibleMultiLineText,
                        'XAccessibleRelationSet': instance.uno_Type_com$sun$star$accessibility$XAccessibleRelationSet,
                        'XAccessibleSelection': instance.uno_Type_com$sun$star$accessibility$XAccessibleSelection,
                        'XAccessibleTable': instance.uno_Type_com$sun$star$accessibility$XAccessibleTable,
                        'XAccessibleTableSelection': instance.uno_Type_com$sun$star$accessibility$XAccessibleTableSelection,
                        'XAccessibleText': instance.uno_Type_com$sun$star$accessibility$XAccessibleText,
                        'XAccessibleTextAttributes': instance.uno_Type_com$sun$star$accessibility$XAccessibleTextAttributes,
                        'XAccessibleTextMarkup': instance.uno_Type_com$sun$star$accessibility$XAccessibleTextMarkup,
                        'XAccessibleTextSelection': instance.uno_Type_com$sun$star$accessibility$XAccessibleTextSelection,
                        'XAccessibleValue': instance.uno_Type_com$sun$star$accessibility$XAccessibleValue,
                        'XMSAAService': instance.uno_Type_com$sun$star$accessibility$XMSAAService,
                        'AccessibleEventId': {
                            'ACTION_CHANGED': 3,
                            'ACTIVE_DESCENDANT_CHANGED': 5,
                            'ACTIVE_DESCENDANT_CHANGED_NOFOCUS': 34,
                            'BOUNDRECT_CHANGED': 6,
                            'CARET_CHANGED': 20,
                            'CHILD': 7,
                            'COLUMN_CHANGED': 40,
                            'CONTENT_FLOWS_FROM_RELATION_CHANGED': 12,
                            'CONTENT_FLOWS_TO_RELATION_CHANGED': 13,
                            'CONTROLLED_BY_RELATION_CHANGED': 14,
                            'CONTROLLER_FOR_RELATION_CHANGED': 15,
                            'DESCRIPTION_CHANGED': 2,
                            'HYPERTEXT_CHANGED': 24,
                            'INVALIDATE_ALL_CHILDREN': 8,
                            'LABELED_BY_RELATION_CHANGED': 17,
                            'LABEL_FOR_RELATION_CHANGED': 16,
                            'LISTBOX_ENTRY_COLLAPSED': 33,
                            'LISTBOX_ENTRY_EXPANDED': 32,
                            'MEMBER_OF_RELATION_CHANGED': 18,
                            'NAME_CHANGED': 1,
                            'PAGE_CHANGED': 38,
                            'ROLE_CHANGED': 41,
                            'SECTION_CHANGED': 39,
                            'SELECTION_CHANGED': 9,
                            'SELECTION_CHANGED_ADD': 35,
                            'SELECTION_CHANGED_REMOVE': 36,
                            'SELECTION_CHANGED_WITHIN': 37,
                            'STATE_CHANGED': 4,
                            'SUB_WINDOW_OF_RELATION_CHANGED': 19,
                            'TABLE_CAPTION_CHANGED': 25,
                            'TABLE_COLUMN_DESCRIPTION_CHANGED': 26,
                            'TABLE_COLUMN_HEADER_CHANGED': 27,
                            'TABLE_MODEL_CHANGED': 28,
                            'TABLE_ROW_DESCRIPTION_CHANGED': 29,
                            'TABLE_ROW_HEADER_CHANGED': 30,
                            'TABLE_SUMMARY_CHANGED': 31,
                            'TEXT_ATTRIBUTE_CHANGED': 23,
                            'TEXT_CHANGED': 22,
                            'TEXT_SELECTION_CHANGED': 21,
                            'VALUE_CHANGED': 11,
                            'VISIBLE_DATA_CHANGED': 10
                        },
                        'AccessibleRelationType': {
                            'CONTENT_FLOWS_FROM': 1,
                            'CONTENT_FLOWS_TO': 2,
                            'CONTROLLED_BY': 3,
                            'CONTROLLER_FOR': 4,
                            'DESCRIBED_BY': 10,
                            'INVALID': 0,
                            'LABELED_BY': 6,
                            'LABEL_FOR': 5,
                            'MEMBER_OF': 7,
                            'NODE_CHILD_OF': 9,
                            'SUB_WINDOW_OF': 8
                        },
                        'AccessibleRole': {
                            'ALERT': 1,
                            'BLOCK_QUOTE': 88,
                            'BUTTON_DROPDOWN': 68,
                            'BUTTON_MENU': 69,
                            'CANVAS': 3,
                            'CAPTION': 70,
                            'CHART': 71,
                            'CHECK_BOX': 4,
                            'CHECK_MENU_ITEM': 5,
                            'COLOR_CHOOSER': 6,
                            'COLUMN_HEADER': 2,
                            'COMBO_BOX': 7,
                            'COMMENT': 81,
                            'COMMENT_END': 82,
                            'DATE_EDITOR': 8,
                            'DESKTOP_ICON': 9,
                            'DESKTOP_PANE': 10,
                            'DIALOG': 12,
                            'DIRECTORY_PANE': 11,
                            'DOCUMENT': 13,
                            'DOCUMENT_PRESENTATION': 83,
                            'DOCUMENT_SPREADSHEET': 84,
                            'DOCUMENT_TEXT': 85,
                            'EDIT_BAR': 72,
                            'EMBEDDED_OBJECT': 14,
                            'END_NOTE': 15,
                            'FILE_CHOOSER': 16,
                            'FILLER': 17,
                            'FONT_CHOOSER': 18,
                            'FOOTER': 19,
                            'FOOTNOTE': 20,
                            'FORM': 73,
                            'FRAME': 21,
                            'GLASS_PANE': 22,
                            'GRAPHIC': 23,
                            'GROUP_BOX': 24,
                            'HEADER': 25,
                            'HEADING': 26,
                            'HYPER_LINK': 27,
                            'ICON': 28,
                            'IMAGE_MAP': 74,
                            'INTERNAL_FRAME': 29,
                            'LABEL': 30,
                            'LAYERED_PANE': 31,
                            'LIST': 32,
                            'LIST_ITEM': 33,
                            'MENU': 34,
                            'MENU_BAR': 35,
                            'MENU_ITEM': 36,
                            'NOTE': 75,
                            'NOTIFICATION': 87,
                            'OPTION_PANE': 37,
                            'PAGE': 76,
                            'PAGE_TAB': 38,
                            'PAGE_TAB_LIST': 39,
                            'PANEL': 40,
                            'PARAGRAPH': 41,
                            'PASSWORD_TEXT': 42,
                            'POPUP_MENU': 43,
                            'PROGRESS_BAR': 45,
                            'PUSH_BUTTON': 44,
                            'RADIO_BUTTON': 46,
                            'RADIO_MENU_ITEM': 47,
                            'ROOT_PANE': 49,
                            'ROW_HEADER': 48,
                            'RULER': 77,
                            'SCROLL_BAR': 50,
                            'SCROLL_PANE': 51,
                            'SECTION': 78,
                            'SEPARATOR': 53,
                            'SHAPE': 52,
                            'SLIDER': 54,
                            'SPIN_BOX': 55,
                            'SPLIT_PANE': 56,
                            'STATIC': 86,
                            'STATUS_BAR': 57,
                            'TABLE': 58,
                            'TABLE_CELL': 59,
                            'TEXT': 60,
                            'TEXT_FRAME': 61,
                            'TOGGLE_BUTTON': 62,
                            'TOOL_BAR': 63,
                            'TOOL_TIP': 64,
                            'TREE': 65,
                            'TREE_ITEM': 79,
                            'TREE_TABLE': 80,
                            'UNKNOWN': 0,
                            'VIEW_PORT': 66,
                            'WINDOW': 67
                        },
                        'AccessibleStateType': {
                            'ACTIVE': 1n,
                            'ARMED': 2n,
                            'BUSY': 4n,
                            'CHECKABLE': 17179869184n,
                            'CHECKED': 8n,
                            'COLLAPSE': 8589934592n,
                            'DEFAULT': 2147483648n,
                            'DEFUNC': 16n,
                            'EDITABLE': 32n,
                            'ENABLED': 64n,
                            'EXPANDABLE': 128n,
                            'EXPANDED': 256n,
                            'FOCUSABLE': 512n,
                            'FOCUSED': 1024n,
                            'HORIZONTAL': 2048n,
                            'ICONIFIED': 4096n,
                            'INDETERMINATE': 8192n,
                            'INVALID': 0n,
                            'MANAGES_DESCENDANTS': 16384n,
                            'MODAL': 32768n,
                            'MOVEABLE': 1073741824n,
                            'MULTI_LINE': 65536n,
                            'MULTI_SELECTABLE': 131072n,
                            'OFFSCREEN': 4294967296n,
                            'OPAQUE': 262144n,
                            'PRESSED': 524288n,
                            'RESIZABLE': 1048576n,
                            'SELECTABLE': 2097152n,
                            'SELECTED': 4194304n,
                            'SENSITIVE': 8388608n,
                            'SHOWING': 16777216n,
                            'SINGLE_LINE': 33554432n,
                            'STALE': 67108864n,
                            'TRANSIENT': 134217728n,
                            'VERTICAL': 268435456n,
                            'VISIBLE': 536870912n
                        },
                        'AccessibleTableModelChangeType': {
                            'COLUMNS_INSERTED': 5,
                            'COLUMNS_REMOVED': 7,
                            'ROWS_INSERTED': 4,
                            'ROWS_REMOVED': 6,
                            'UPDATE': 3
                        },
                        'AccessibleTextType': {
                            'ATTRIBUTE_RUN': 7,
                            'CHARACTER': 1,
                            'GLYPH': 6,
                            'LINE': 5,
                            'PARAGRAPH': 4,
                            'SENTENCE': 3,
                            'WORD': 2
                        },
                        'GetStandardAccessibleFactoryService': {
                            'create': instance.uno_Function_com$sun$star$accessibility$GetStandardAccessibleFactoryService$$create
                        },
                        'MSAAService': {
                            'create': instance.uno_Function_com$sun$star$accessibility$MSAAService$$create
                        }
                    },
                    'animations': {
                        'Event': instance.uno_Type_com$sun$star$animations$Event,
                        'TargetProperties': instance.uno_Type_com$sun$star$animations$TargetProperties,
                        'TimeFilterPair': instance.uno_Type_com$sun$star$animations$TimeFilterPair,
                        'Timing': instance.uno_Type_com$sun$star$animations$Timing,
                        'ValuePair': instance.uno_Type_com$sun$star$animations$ValuePair,
                        'XAnimate': instance.uno_Type_com$sun$star$animations$XAnimate,
                        'XAnimateColor': instance.uno_Type_com$sun$star$animations$XAnimateColor,
                        'XAnimateMotion': instance.uno_Type_com$sun$star$animations$XAnimateMotion,
                        'XAnimatePhysics': instance.uno_Type_com$sun$star$animations$XAnimatePhysics,
                        'XAnimateSet': instance.uno_Type_com$sun$star$animations$XAnimateSet,
                        'XAnimateTransform': instance.uno_Type_com$sun$star$animations$XAnimateTransform,
                        'XAnimationListener': instance.uno_Type_com$sun$star$animations$XAnimationListener,
                        'XAnimationNode': instance.uno_Type_com$sun$star$animations$XAnimationNode,
                        'XAnimationNodeSupplier': instance.uno_Type_com$sun$star$animations$XAnimationNodeSupplier,
                        'XAudio': instance.uno_Type_com$sun$star$animations$XAudio,
                        'XCommand': instance.uno_Type_com$sun$star$animations$XCommand,
                        'XIterateContainer': instance.uno_Type_com$sun$star$animations$XIterateContainer,
                        'XParallelTimeContainer': instance.uno_Type_com$sun$star$animations$XParallelTimeContainer,
                        'XTimeContainer': instance.uno_Type_com$sun$star$animations$XTimeContainer,
                        'XTransitionFilter': instance.uno_Type_com$sun$star$animations$XTransitionFilter,
                        'AnimateColor': {
                            'create': instance.uno_Function_com$sun$star$animations$AnimateColor$$create
                        },
                        'AnimateMotion': {
                            'create': instance.uno_Function_com$sun$star$animations$AnimateMotion$$create
                        },
                        'AnimatePhysics': {
                            'create': instance.uno_Function_com$sun$star$animations$AnimatePhysics$$create
                        },
                        'AnimateSet': {
                            'create': instance.uno_Function_com$sun$star$animations$AnimateSet$$create
                        },
                        'AnimationAdditiveMode': {
                            'BASE': 0,
                            'MULTIPLY': 3,
                            'NONE': 4,
                            'REPLACE': 2,
                            'SUM': 1
                        },
                        'AnimationCalcMode': {
                            'DISCRETE': 0,
                            'LINEAR': 1,
                            'PACED': 2,
                            'SPLINE': 3
                        },
                        'AnimationColorSpace': {
                            'HSL': 1,
                            'RGB': 0
                        },
                        'AnimationEndSync': {
                            'ALL': 2,
                            'FIRST': 0,
                            'LAST': 1,
                            'MEDIA': 3
                        },
                        'AnimationFill': {
                            'AUTO': 5,
                            'DEFAULT': 0,
                            'FREEZE': 2,
                            'HOLD': 3,
                            'INHERIT': 0,
                            'REMOVE': 1,
                            'TRANSITION': 4
                        },
                        'AnimationNodeType': {
                            'ANIMATE': 4,
                            'ANIMATECOLOR': 7,
                            'ANIMATEMOTION': 6,
                            'ANIMATEPHYSICS': 12,
                            'ANIMATETRANSFORM': 8,
                            'AUDIO': 10,
                            'COMMAND': 11,
                            'CUSTOM': 0,
                            'ITERATE': 3,
                            'PAR': 1,
                            'SEQ': 2,
                            'SET': 5,
                            'TRANSITIONFILTER': 9
                        },
                        'AnimationRestart': {
                            'ALWAYS': 1,
                            'DEFAULT': 0,
                            'INHERIT': 0,
                            'NEVER': 3,
                            'WHEN_NOT_ACTIVE': 2
                        },
                        'AnimationTransformType': {
                            'ROTATE': 2,
                            'SCALE': 1,
                            'SKEWX': 3,
                            'SKEWY': 4,
                            'TRANSLATE': 0
                        },
                        'AnimationValueType': {
                            'COLOR': 2,
                            'NUMBER': 1,
                            'STRING': 0
                        },
                        'Audio': {
                            'create': instance.uno_Function_com$sun$star$animations$Audio$$create
                        },
                        'Command': {
                            'create': instance.uno_Function_com$sun$star$animations$Command$$create
                        },
                        'EventTrigger': {
                            'BEGIN_EVENT': 3,
                            'END_EVENT': 4,
                            'NONE': 0,
                            'ON_BEGIN': 1,
                            'ON_CLICK': 5,
                            'ON_DBL_CLICK': 6,
                            'ON_END': 2,
                            'ON_MOUSE_ENTER': 7,
                            'ON_MOUSE_LEAVE': 8,
                            'ON_NEXT': 9,
                            'ON_PREV': 10,
                            'ON_STOP_AUDIO': 11,
                            'REPEAT': 12
                        },
                        'IterateContainer': {
                            'create': instance.uno_Function_com$sun$star$animations$IterateContainer$$create
                        },
                        'ParallelTimeContainer': {
                            'create': instance.uno_Function_com$sun$star$animations$ParallelTimeContainer$$create
                        },
                        'SequenceTimeContainer': {
                            'create': instance.uno_Function_com$sun$star$animations$SequenceTimeContainer$$create
                        },
                        'TransitionSubType': {
                            'ACROSS': 108,
                            'BOTTOM': 52,
                            'BOTTOMCENTER': 9,
                            'BOTTOMLEFT': 6,
                            'BOTTOMLEFTCLOCKWISE': 72,
                            'BOTTOMLEFTCOUNTERCLOCKWISE': 76,
                            'BOTTOMLEFTDIAGONAL': 68,
                            'BOTTOMRIGHT': 5,
                            'BOTTOMRIGHTCLOCKWISE': 71,
                            'BOTTOMRIGHTCOUNTERCLOCKWISE': 75,
                            'BOTTOMRIGHTDIAGONAL': 67,
                            'CENTERRIGHT': 49,
                            'CENTERTOP': 48,
                            'CIRCLE': 27,
                            'CLOCKWISEBOTTOM': 42,
                            'CLOCKWISEBOTTOMRIGHT': 46,
                            'CLOCKWISELEFT': 43,
                            'CLOCKWISENINE': 36,
                            'CLOCKWISERIGHT': 41,
                            'CLOCKWISESIX': 35,
                            'CLOCKWISETHREE': 34,
                            'CLOCKWISETOP': 40,
                            'CLOCKWISETOPLEFT': 44,
                            'CLOCKWISETWELVE': 33,
                            'COMBHORIZONTAL': 110,
                            'COMBVERTICAL': 111,
                            'CORNERSIN': 11,
                            'CORNERSOUT': 12,
                            'COUNTERCLOCKWISEBOTTOMLEFT': 45,
                            'COUNTERCLOCKWISETOPRIGHT': 47,
                            'CROSSFADE': 101,
                            'DEFAULT': 0,
                            'DIAGONALBOTTOMLEFT': 15,
                            'DIAGONALBOTTOMLEFTOPPOSITE': 85,
                            'DIAGONALTOPLEFT': 16,
                            'DIAGONALTOPLEFTOPPOSITE': 86,
                            'DIAMOND': 26,
                            'DOUBLEBARNDOOR': 17,
                            'DOUBLEDIAMOND': 18,
                            'DOWN': 19,
                            'EIGHTBLADE': 106,
                            'FADEFROMCOLOR': 103,
                            'FADEOVERCOLOR': 104,
                            'FADETOCOLOR': 102,
                            'FANINHORIZONTAL': 57,
                            'FANINVERTICAL': 56,
                            'FANOUTHORIZONTAL': 55,
                            'FANOUTVERTICAL': 54,
                            'FIVEPOINT': 29,
                            'FOURBLADE': 39,
                            'FOURBOXHORIZONTAL': 92,
                            'FOURBOXVERTICAL': 91,
                            'FOURPOINT': 28,
                            'FROMBOTTOM': 100,
                            'FROMBOTTOMLEFT': 118,
                            'FROMBOTTOMRIGHT': 119,
                            'FROMLEFT': 97,
                            'FROMRIGHT': 99,
                            'FROMTOP': 98,
                            'FROMTOPLEFT': 116,
                            'FROMTOPRIGHT': 117,
                            'HEART': 31,
                            'HORIZONTAL': 14,
                            'HORIZONTALLEFT': 95,
                            'HORIZONTALLEFTSAME': 81,
                            'HORIZONTALRIGHT': 96,
                            'HORIZONTALRIGHTSAME': 82,
                            'HORIZONTALTOPLEFTOPPOSITE': 83,
                            'HORIZONTALTOPRIGHTOPPOSITE': 84,
                            'IN': 112,
                            'KEYHOLE': 32,
                            'LEFT': 20,
                            'LEFTCENTER': 10,
                            'LEFTTORIGHT': 1,
                            'ONEBLADE': 107,
                            'OPPOSITEHORIZONTAL': 61,
                            'OPPOSITEVERTICAL': 60,
                            'OUT': 113,
                            'PARALLELDIAGONAL': 59,
                            'PARALLELDIAGONALBOTTOMLEFT': 63,
                            'PARALLELDIAGONALTOPLEFT': 62,
                            'PARALLELVERTICAL': 58,
                            'RECTANGLE': 25,
                            'RIGHT': 22,
                            'RIGHTCENTER': 8,
                            'ROTATEIN': 114,
                            'ROTATEOUT': 115,
                            'SIXPOINT': 30,
                            'THREEBLADE': 105,
                            'TOP': 50,
                            'TOPCENTER': 7,
                            'TOPLEFT': 3,
                            'TOPLEFTCLOCKWISE': 69,
                            'TOPLEFTCOUNTERCLOCKWISE': 73,
                            'TOPLEFTDIAGONAL': 65,
                            'TOPLEFTHORIZONTAL': 64,
                            'TOPLEFTVERTICAL': 109,
                            'TOPRIGHT': 4,
                            'TOPRIGHTCLOCKWISE': 70,
                            'TOPRIGHTCOUNTERCLOCKWISE': 74,
                            'TOPRIGHTDIAGONAL': 66,
                            'TOPTOBOTTOM': 2,
                            'TWOBLADEHORIZONTAL': 38,
                            'TWOBLADEVERTICAL': 37,
                            'TWOBOXBOTTOM': 88,
                            'TWOBOXLEFT': 89,
                            'TWOBOXRIGHT': 90,
                            'TWOBOXTOP': 87,
                            'UP': 21,
                            'VERTICAL': 13,
                            'VERTICALBOTTOMLEFTOPPOSITE': 80,
                            'VERTICALBOTTOMSAME': 78,
                            'VERTICALLEFT': 93,
                            'VERTICALRIGHT': 94,
                            'VERTICALTOPLEFTOPPOSITE': 79,
                            'VERTICALTOPSAME': 77
                        },
                        'TransitionType': {
                            'ARROWHEADWIPE': 14,
                            'BARNDOORWIPE': 4,
                            'BARNVEEWIPE': 9,
                            'BARNZIGZAGWIPE': 11,
                            'BARWIPE': 1,
                            'BLINDSWIPE': 41,
                            'BOWTIEWIPE': 6,
                            'BOXSNAKESWIPE': 33,
                            'BOXWIPE': 2,
                            'CHECKERBOARDWIPE': 39,
                            'CLOCKWIPE': 22,
                            'DIAGONALWIPE': 5,
                            'DISSOLVE': 40,
                            'DOUBLEFANWIPE': 26,
                            'DOUBLESWEEPWIPE': 27,
                            'ELLIPSEWIPE': 17,
                            'EYEWIPE': 18,
                            'FADE': 37,
                            'FANWIPE': 25,
                            'FOURBOXWIPE': 3,
                            'HEXAGONWIPE': 16,
                            'IRISWIPE': 12,
                            'MISCDIAGONALWIPE': 7,
                            'MISCSHAPEWIPE': 21,
                            'PARALLELSNAKESWIPE': 32,
                            'PENTAGONWIPE': 15,
                            'PINWHEELWIPE': 23,
                            'PUSHWIPE': 35,
                            'RANDOM': 42,
                            'RANDOMBARWIPE': 38,
                            'ROUNDRECTWIPE': 19,
                            'SALOONDOORWIPE': 28,
                            'SINGLESWEEPWIPE': 24,
                            'SLIDEWIPE': 36,
                            'SNAKEWIPE': 30,
                            'SPIRALWIPE': 31,
                            'STARWIPE': 20,
                            'TRIANGLEWIPE': 13,
                            'VEEWIPE': 8,
                            'WATERFALLWIPE': 34,
                            'WINDSHIELDWIPE': 29,
                            'ZIGZAGWIPE': 10,
                            'ZOOM': 43
                        }
                    },
                    'auth': {
                        'AuthenticationFailedException': instance.uno_Type_com$sun$star$auth$AuthenticationFailedException,
                        'InvalidArgumentException': instance.uno_Type_com$sun$star$auth$InvalidArgumentException,
                        'InvalidContextException': instance.uno_Type_com$sun$star$auth$InvalidContextException,
                        'InvalidCredentialException': instance.uno_Type_com$sun$star$auth$InvalidCredentialException,
                        'InvalidPrincipalException': instance.uno_Type_com$sun$star$auth$InvalidPrincipalException,
                        'PersistenceFailureException': instance.uno_Type_com$sun$star$auth$PersistenceFailureException,
                        'UnsupportedException': instance.uno_Type_com$sun$star$auth$UnsupportedException,
                        'XSSOAcceptorContext': instance.uno_Type_com$sun$star$auth$XSSOAcceptorContext,
                        'XSSOContext': instance.uno_Type_com$sun$star$auth$XSSOContext,
                        'XSSOInitiatorContext': instance.uno_Type_com$sun$star$auth$XSSOInitiatorContext,
                        'XSSOManager': instance.uno_Type_com$sun$star$auth$XSSOManager,
                        'XSSOManagerFactory': instance.uno_Type_com$sun$star$auth$XSSOManagerFactory,
                        'XSSOPasswordCache': instance.uno_Type_com$sun$star$auth$XSSOPasswordCache,
                        'SSOManagerFactory': {
                            'create': instance.uno_Function_com$sun$star$auth$SSOManagerFactory$$create
                        },
                        'SSOPasswordCache': {
                            'create': instance.uno_Function_com$sun$star$auth$SSOPasswordCache$$create
                        }
                    },
                    'awt': {
                        'ActionEvent': instance.uno_Type_com$sun$star$awt$ActionEvent,
                        'AdjustmentEvent': instance.uno_Type_com$sun$star$awt$AdjustmentEvent,
                        'AdjustmentType': instance.uno_Type_com$sun$star$awt$AdjustmentType,
                        'ColorStop': instance.uno_Type_com$sun$star$awt$ColorStop,
                        'DeviceInfo': instance.uno_Type_com$sun$star$awt$DeviceInfo,
                        'DockingData': instance.uno_Type_com$sun$star$awt$DockingData,
                        'DockingEvent': instance.uno_Type_com$sun$star$awt$DockingEvent,
                        'EndDockingEvent': instance.uno_Type_com$sun$star$awt$EndDockingEvent,
                        'EndPopupModeEvent': instance.uno_Type_com$sun$star$awt$EndPopupModeEvent,
                        'EnhancedMouseEvent': instance.uno_Type_com$sun$star$awt$EnhancedMouseEvent,
                        'FocusEvent': instance.uno_Type_com$sun$star$awt$FocusEvent,
                        'FontDescriptor': instance.uno_Type_com$sun$star$awt$FontDescriptor,
                        'FontSlant': instance.uno_Type_com$sun$star$awt$FontSlant,
                        'Gradient': instance.uno_Type_com$sun$star$awt$Gradient,
                        'Gradient2': instance.uno_Type_com$sun$star$awt$Gradient2,
                        'GradientStyle': instance.uno_Type_com$sun$star$awt$GradientStyle,
                        'InputEvent': instance.uno_Type_com$sun$star$awt$InputEvent,
                        'ItemEvent': instance.uno_Type_com$sun$star$awt$ItemEvent,
                        'ItemListEvent': instance.uno_Type_com$sun$star$awt$ItemListEvent,
                        'KeyEvent': instance.uno_Type_com$sun$star$awt$KeyEvent,
                        'KeyStroke': instance.uno_Type_com$sun$star$awt$KeyStroke,
                        'MenuEvent': instance.uno_Type_com$sun$star$awt$MenuEvent,
                        'MenuItemType': instance.uno_Type_com$sun$star$awt$MenuItemType,
                        'MessageBoxType': instance.uno_Type_com$sun$star$awt$MessageBoxType,
                        'MouseEvent': instance.uno_Type_com$sun$star$awt$MouseEvent,
                        'PaintEvent': instance.uno_Type_com$sun$star$awt$PaintEvent,
                        'Point': instance.uno_Type_com$sun$star$awt$Point,
                        'PrinterException': instance.uno_Type_com$sun$star$awt$PrinterException,
                        'PushButtonType': instance.uno_Type_com$sun$star$awt$PushButtonType,
                        'RasterOperation': instance.uno_Type_com$sun$star$awt$RasterOperation,
                        'Rectangle': instance.uno_Type_com$sun$star$awt$Rectangle,
                        'Selection': instance.uno_Type_com$sun$star$awt$Selection,
                        'SimpleFontMetric': instance.uno_Type_com$sun$star$awt$SimpleFontMetric,
                        'Size': instance.uno_Type_com$sun$star$awt$Size,
                        'SpinEvent': instance.uno_Type_com$sun$star$awt$SpinEvent,
                        'SystemDependentXWindow': instance.uno_Type_com$sun$star$awt$SystemDependentXWindow,
                        'TextEvent': instance.uno_Type_com$sun$star$awt$TextEvent,
                        'VclContainerEvent': instance.uno_Type_com$sun$star$awt$VclContainerEvent,
                        'WindowClass': instance.uno_Type_com$sun$star$awt$WindowClass,
                        'WindowDescriptor': instance.uno_Type_com$sun$star$awt$WindowDescriptor,
                        'WindowEvent': instance.uno_Type_com$sun$star$awt$WindowEvent,
                        'XActionListener': instance.uno_Type_com$sun$star$awt$XActionListener,
                        'XActivateListener': instance.uno_Type_com$sun$star$awt$XActivateListener,
                        'XAdjustmentListener': instance.uno_Type_com$sun$star$awt$XAdjustmentListener,
                        'XAnimatedImages': instance.uno_Type_com$sun$star$awt$XAnimatedImages,
                        'XAnimation': instance.uno_Type_com$sun$star$awt$XAnimation,
                        'XBitmap': instance.uno_Type_com$sun$star$awt$XBitmap,
                        'XButton': instance.uno_Type_com$sun$star$awt$XButton,
                        'XCallback': instance.uno_Type_com$sun$star$awt$XCallback,
                        'XCheckBox': instance.uno_Type_com$sun$star$awt$XCheckBox,
                        'XComboBox': instance.uno_Type_com$sun$star$awt$XComboBox,
                        'XContainerWindowEventHandler': instance.uno_Type_com$sun$star$awt$XContainerWindowEventHandler,
                        'XContainerWindowProvider': instance.uno_Type_com$sun$star$awt$XContainerWindowProvider,
                        'XControl': instance.uno_Type_com$sun$star$awt$XControl,
                        'XControlContainer': instance.uno_Type_com$sun$star$awt$XControlContainer,
                        'XControlModel': instance.uno_Type_com$sun$star$awt$XControlModel,
                        'XCurrencyField': instance.uno_Type_com$sun$star$awt$XCurrencyField,
                        'XDataTransferProviderAccess': instance.uno_Type_com$sun$star$awt$XDataTransferProviderAccess,
                        'XDateField': instance.uno_Type_com$sun$star$awt$XDateField,
                        'XDevice': instance.uno_Type_com$sun$star$awt$XDevice,
                        'XDialog': instance.uno_Type_com$sun$star$awt$XDialog,
                        'XDialog2': instance.uno_Type_com$sun$star$awt$XDialog2,
                        'XDialogEventHandler': instance.uno_Type_com$sun$star$awt$XDialogEventHandler,
                        'XDialogProvider': instance.uno_Type_com$sun$star$awt$XDialogProvider,
                        'XDialogProvider2': instance.uno_Type_com$sun$star$awt$XDialogProvider2,
                        'XDisplayBitmap': instance.uno_Type_com$sun$star$awt$XDisplayBitmap,
                        'XDisplayConnection': instance.uno_Type_com$sun$star$awt$XDisplayConnection,
                        'XDockableWindow': instance.uno_Type_com$sun$star$awt$XDockableWindow,
                        'XDockableWindowListener': instance.uno_Type_com$sun$star$awt$XDockableWindowListener,
                        'XEnhancedMouseClickHandler': instance.uno_Type_com$sun$star$awt$XEnhancedMouseClickHandler,
                        'XEventHandler': instance.uno_Type_com$sun$star$awt$XEventHandler,
                        'XExtendedToolkit': instance.uno_Type_com$sun$star$awt$XExtendedToolkit,
                        'XFileDialog': instance.uno_Type_com$sun$star$awt$XFileDialog,
                        'XFixedHyperlink': instance.uno_Type_com$sun$star$awt$XFixedHyperlink,
                        'XFixedText': instance.uno_Type_com$sun$star$awt$XFixedText,
                        'XFocusListener': instance.uno_Type_com$sun$star$awt$XFocusListener,
                        'XFont': instance.uno_Type_com$sun$star$awt$XFont,
                        'XFont2': instance.uno_Type_com$sun$star$awt$XFont2,
                        'XFontMappingUse': instance.uno_Type_com$sun$star$awt$XFontMappingUse,
                        'XFontMappingUseItem': instance.uno_Type_com$sun$star$awt$XFontMappingUseItem,
                        'XGraphics': instance.uno_Type_com$sun$star$awt$XGraphics,
                        'XGraphics2': instance.uno_Type_com$sun$star$awt$XGraphics2,
                        'XImageButton': instance.uno_Type_com$sun$star$awt$XImageButton,
                        'XImageConsumer': instance.uno_Type_com$sun$star$awt$XImageConsumer,
                        'XImageProducer': instance.uno_Type_com$sun$star$awt$XImageProducer,
                        'XInfoPrinter': instance.uno_Type_com$sun$star$awt$XInfoPrinter,
                        'XItemEventBroadcaster': instance.uno_Type_com$sun$star$awt$XItemEventBroadcaster,
                        'XItemList': instance.uno_Type_com$sun$star$awt$XItemList,
                        'XItemListListener': instance.uno_Type_com$sun$star$awt$XItemListListener,
                        'XItemListener': instance.uno_Type_com$sun$star$awt$XItemListener,
                        'XKeyHandler': instance.uno_Type_com$sun$star$awt$XKeyHandler,
                        'XKeyListener': instance.uno_Type_com$sun$star$awt$XKeyListener,
                        'XLayoutConstrains': instance.uno_Type_com$sun$star$awt$XLayoutConstrains,
                        'XListBox': instance.uno_Type_com$sun$star$awt$XListBox,
                        'XMenu': instance.uno_Type_com$sun$star$awt$XMenu,
                        'XMenuBar': instance.uno_Type_com$sun$star$awt$XMenuBar,
                        'XMenuListener': instance.uno_Type_com$sun$star$awt$XMenuListener,
                        'XMessageBox': instance.uno_Type_com$sun$star$awt$XMessageBox,
                        'XMessageBoxFactory': instance.uno_Type_com$sun$star$awt$XMessageBoxFactory,
                        'XMetricField': instance.uno_Type_com$sun$star$awt$XMetricField,
                        'XMouseClickHandler': instance.uno_Type_com$sun$star$awt$XMouseClickHandler,
                        'XMouseListener': instance.uno_Type_com$sun$star$awt$XMouseListener,
                        'XMouseMotionHandler': instance.uno_Type_com$sun$star$awt$XMouseMotionHandler,
                        'XMouseMotionListener': instance.uno_Type_com$sun$star$awt$XMouseMotionListener,
                        'XNumericField': instance.uno_Type_com$sun$star$awt$XNumericField,
                        'XPaintListener': instance.uno_Type_com$sun$star$awt$XPaintListener,
                        'XPatternField': instance.uno_Type_com$sun$star$awt$XPatternField,
                        'XPointer': instance.uno_Type_com$sun$star$awt$XPointer,
                        'XPopupMenu': instance.uno_Type_com$sun$star$awt$XPopupMenu,
                        'XPrinter': instance.uno_Type_com$sun$star$awt$XPrinter,
                        'XPrinterPropertySet': instance.uno_Type_com$sun$star$awt$XPrinterPropertySet,
                        'XPrinterServer': instance.uno_Type_com$sun$star$awt$XPrinterServer,
                        'XPrinterServer2': instance.uno_Type_com$sun$star$awt$XPrinterServer2,
                        'XProgressBar': instance.uno_Type_com$sun$star$awt$XProgressBar,
                        'XProgressMonitor': instance.uno_Type_com$sun$star$awt$XProgressMonitor,
                        'XRadioButton': instance.uno_Type_com$sun$star$awt$XRadioButton,
                        'XRegion': instance.uno_Type_com$sun$star$awt$XRegion,
                        'XRequestCallback': instance.uno_Type_com$sun$star$awt$XRequestCallback,
                        'XReschedule': instance.uno_Type_com$sun$star$awt$XReschedule,
                        'XScrollBar': instance.uno_Type_com$sun$star$awt$XScrollBar,
                        'XSimpleTabController': instance.uno_Type_com$sun$star$awt$XSimpleTabController,
                        'XSpinField': instance.uno_Type_com$sun$star$awt$XSpinField,
                        'XSpinListener': instance.uno_Type_com$sun$star$awt$XSpinListener,
                        'XSpinValue': instance.uno_Type_com$sun$star$awt$XSpinValue,
                        'XStyleChangeListener': instance.uno_Type_com$sun$star$awt$XStyleChangeListener,
                        'XStyleSettings': instance.uno_Type_com$sun$star$awt$XStyleSettings,
                        'XStyleSettingsSupplier': instance.uno_Type_com$sun$star$awt$XStyleSettingsSupplier,
                        'XSystemChildFactory': instance.uno_Type_com$sun$star$awt$XSystemChildFactory,
                        'XSystemDependentMenuPeer': instance.uno_Type_com$sun$star$awt$XSystemDependentMenuPeer,
                        'XSystemDependentWindowPeer': instance.uno_Type_com$sun$star$awt$XSystemDependentWindowPeer,
                        'XTabController': instance.uno_Type_com$sun$star$awt$XTabController,
                        'XTabControllerModel': instance.uno_Type_com$sun$star$awt$XTabControllerModel,
                        'XTabListener': instance.uno_Type_com$sun$star$awt$XTabListener,
                        'XTextArea': instance.uno_Type_com$sun$star$awt$XTextArea,
                        'XTextComponent': instance.uno_Type_com$sun$star$awt$XTextComponent,
                        'XTextEditField': instance.uno_Type_com$sun$star$awt$XTextEditField,
                        'XTextLayoutConstrains': instance.uno_Type_com$sun$star$awt$XTextLayoutConstrains,
                        'XTextListener': instance.uno_Type_com$sun$star$awt$XTextListener,
                        'XTimeField': instance.uno_Type_com$sun$star$awt$XTimeField,
                        'XToggleButton': instance.uno_Type_com$sun$star$awt$XToggleButton,
                        'XToolkit': instance.uno_Type_com$sun$star$awt$XToolkit,
                        'XToolkit2': instance.uno_Type_com$sun$star$awt$XToolkit2,
                        'XToolkit3': instance.uno_Type_com$sun$star$awt$XToolkit3,
                        'XToolkitExperimental': instance.uno_Type_com$sun$star$awt$XToolkitExperimental,
                        'XToolkitRobot': instance.uno_Type_com$sun$star$awt$XToolkitRobot,
                        'XTopWindow': instance.uno_Type_com$sun$star$awt$XTopWindow,
                        'XTopWindow2': instance.uno_Type_com$sun$star$awt$XTopWindow2,
                        'XTopWindowListener': instance.uno_Type_com$sun$star$awt$XTopWindowListener,
                        'XUnitConversion': instance.uno_Type_com$sun$star$awt$XUnitConversion,
                        'XUnoControlContainer': instance.uno_Type_com$sun$star$awt$XUnoControlContainer,
                        'XUnoControlDialog': instance.uno_Type_com$sun$star$awt$XUnoControlDialog,
                        'XUserInputInterception': instance.uno_Type_com$sun$star$awt$XUserInputInterception,
                        'XVclContainer': instance.uno_Type_com$sun$star$awt$XVclContainer,
                        'XVclContainerListener': instance.uno_Type_com$sun$star$awt$XVclContainerListener,
                        'XVclContainerPeer': instance.uno_Type_com$sun$star$awt$XVclContainerPeer,
                        'XVclWindowPeer': instance.uno_Type_com$sun$star$awt$XVclWindowPeer,
                        'XView': instance.uno_Type_com$sun$star$awt$XView,
                        'XWindow': instance.uno_Type_com$sun$star$awt$XWindow,
                        'XWindow2': instance.uno_Type_com$sun$star$awt$XWindow2,
                        'XWindowListener': instance.uno_Type_com$sun$star$awt$XWindowListener,
                        'XWindowListener2': instance.uno_Type_com$sun$star$awt$XWindowListener2,
                        'XWindowPeer': instance.uno_Type_com$sun$star$awt$XWindowPeer,
                        'AsyncCallback': {
                            'create': instance.uno_Function_com$sun$star$awt$AsyncCallback$$create
                        },
                        'CharSet': {
                            'ANSI': 1,
                            'DONTKNOW': 0,
                            'IBMPC_437': 3,
                            'IBMPC_850': 4,
                            'IBMPC_860': 5,
                            'IBMPC_861': 6,
                            'IBMPC_863': 7,
                            'IBMPC_865': 8,
                            'MAC': 2,
                            'SYMBOL': 10,
                            'SYSTEM': 9
                        },
                        'Command': {
                            'AUTOSCROLL': 5,
                            'CONTEXTMENU': 1,
                            'CURSORPOS': 11,
                            'ENDEXTTEXTINPUT': 9,
                            'EXTTEXTINPUT': 8,
                            'HANGUL_HANJA_CONVERSION': 14,
                            'INPUTCONTEXTCHANGE': 10,
                            'MODKEYCHANGE': 13,
                            'PASTESELECTION': 12,
                            'STARTAUTOSCROLL': 4,
                            'STARTDRAG': 2,
                            'STARTEXTTEXTINPUT': 7,
                            'USER': 4096,
                            'VOICE': 6,
                            'WHEEL': 3
                        },
                        'ContainerWindowProvider': {
                            'create': instance.uno_Function_com$sun$star$awt$ContainerWindowProvider$$create
                        },
                        'DeviceCapability': {
                            'GETBITS': 2,
                            'RASTEROPERATIONS': 1
                        },
                        'DialogProvider': {
                            'createWithModel': instance.uno_Function_com$sun$star$awt$DialogProvider$$createWithModel,
                            'createWithModelAndScripting': instance.uno_Function_com$sun$star$awt$DialogProvider$$createWithModelAndScripting
                        },
                        'DialogProvider2': {
                            'create': instance.uno_Function_com$sun$star$awt$DialogProvider2$$create
                        },
                        'FieldUnit': {
                            'FUNIT_100TH_MM': 13,
                            'FUNIT_CM': 2,
                            'FUNIT_CUSTOM': 11,
                            'FUNIT_FOOT': 9,
                            'FUNIT_INCH': 8,
                            'FUNIT_KM': 4,
                            'FUNIT_M': 3,
                            'FUNIT_MILE': 10,
                            'FUNIT_MM': 1,
                            'FUNIT_NONE': 0,
                            'FUNIT_PERCENT': 12,
                            'FUNIT_PICA': 7,
                            'FUNIT_POINT': 6,
                            'FUNIT_TWIP': 5
                        },
                        'FocusChangeReason': {
                            'AROUND': 64,
                            'BACKWARD': 32,
                            'CURSOR': 2,
                            'FORWARD': 16,
                            'MNEMONIC': 4,
                            'TAB': 1,
                            'UNIQUEMNEMONIC': 256
                        },
                        'FontEmphasisMark': {
                            'ABOVE': 4096,
                            'ACCENT': 4,
                            'BELOW': 8192,
                            'CIRCLE': 2,
                            'DISC': 3,
                            'DOT': 1,
                            'NONE': 0
                        },
                        'FontFamily': {
                            'DECORATIVE': 1,
                            'DONTKNOW': 0,
                            'MODERN': 2,
                            'ROMAN': 3,
                            'SCRIPT': 4,
                            'SWISS': 5,
                            'SYSTEM': 6
                        },
                        'FontPitch': {
                            'DONTKNOW': 0,
                            'FIXED': 1,
                            'VARIABLE': 2
                        },
                        'FontRelief': {
                            'EMBOSSED': 1,
                            'ENGRAVED': 2,
                            'NONE': 0
                        },
                        'FontStrikeout': {
                            'BOLD': 4,
                            'DONTKNOW': 3,
                            'DOUBLE': 2,
                            'NONE': 0,
                            'SINGLE': 1,
                            'SLASH': 5,
                            'X': 6
                        },
                        'FontType': {
                            'DEVICE': 2,
                            'DONTKNOW': 0,
                            'RASTER': 1,
                            'SCALABLE': 4
                        },
                        'FontUnderline': {
                            'BOLD': 12,
                            'BOLDDASH': 14,
                            'BOLDDASHDOT': 16,
                            'BOLDDASHDOTDOT': 17,
                            'BOLDDOTTED': 13,
                            'BOLDLONGDASH': 15,
                            'BOLDWAVE': 18,
                            'DASH': 5,
                            'DASHDOT': 7,
                            'DASHDOTDOT': 8,
                            'DONTKNOW': 4,
                            'DOTTED': 3,
                            'DOUBLE': 2,
                            'DOUBLEWAVE': 11,
                            'LONGDASH': 6,
                            'NONE': 0,
                            'SINGLE': 1,
                            'SMALLWAVE': 9,
                            'WAVE': 10
                        },
                        'FontWeight': {
                            'BLACK': 200,
                            'BOLD': 150,
                            'DONTKNOW': 0,
                            'LIGHT': 75,
                            'NORMAL': 100,
                            'SEMIBOLD': 110,
                            'SEMILIGHT': 90,
                            'THIN': 50,
                            'ULTRABOLD': 175,
                            'ULTRALIGHT': 60
                        },
                        'FontWidth': {
                            'CONDENSED': 75,
                            'DONTKNOW': 0,
                            'EXPANDED': 150,
                            'EXTRACONDENSED': 60,
                            'EXTRAEXPANDED': 175,
                            'NORMAL': 100,
                            'SEMICONDENSED': 90,
                            'SEMIEXPANDED': 110,
                            'ULTRACONDENSED': 50,
                            'ULTRAEXPANDED': 200
                        },
                        'ImageAlign': {
                            'BOTTOM': 3,
                            'LEFT': 0,
                            'RIGHT': 2,
                            'TOP': 1
                        },
                        'ImageDrawMode': {
                            'DEACTIVE': 4,
                            'DISABLE': 1,
                            'HIGHLIGHT': 2,
                            'NONE': 0,
                            'SEMITRANSPARENT': 16
                        },
                        'ImagePosition': {
                            'AboveCenter': 7,
                            'AboveLeft': 6,
                            'AboveRight': 8,
                            'BelowCenter': 10,
                            'BelowLeft': 9,
                            'BelowRight': 11,
                            'Centered': 12,
                            'LeftBottom': 2,
                            'LeftCenter': 1,
                            'LeftTop': 0,
                            'RightBottom': 5,
                            'RightCenter': 4,
                            'RightTop': 3
                        },
                        'ImageScaleMode': {
                            'ANISOTROPIC': 2,
                            'ISOTROPIC': 1,
                            'NONE': 0
                        },
                        'ImageStatus': {
                            'IMAGESTATUS_ABORTED': 4,
                            'IMAGESTATUS_ERROR': 1,
                            'IMAGESTATUS_SINGLEFRAMEDONE': 2,
                            'IMAGESTATUS_STATICIMAGEDONE': 3
                        },
                        'InvalidateStyle': {
                            'CHILDREN': 1,
                            'NOCHILDREN': 2,
                            'NOCLIPCHILDREN': 16384,
                            'NOERASE': 4,
                            'NOTRANSPARENT': 32,
                            'TRANSPARENT': 16,
                            'UPDATE': 8
                        },
                        'Key': {
                            'A': 512,
                            'ADD': 1287,
                            'B': 513,
                            'BACKSPACE': 1283,
                            'BRACKETLEFT': 1315,
                            'BRACKETRIGHT': 1316,
                            'C': 514,
                            'CAPSLOCK': 1312,
                            'COLON': 1320,
                            'COMMA': 1292,
                            'CONTEXTMENU': 1305,
                            'COPY': 1298,
                            'CUT': 1297,
                            'D': 515,
                            'DECIMAL': 1309,
                            'DELETE': 1286,
                            'DELETE_TO_BEGIN_OF_LINE': 1536,
                            'DELETE_TO_BEGIN_OF_PARAGRAPH': 1538,
                            'DELETE_TO_END_OF_LINE': 1537,
                            'DELETE_TO_END_OF_PARAGRAPH': 1539,
                            'DELETE_WORD_BACKWARD': 1540,
                            'DELETE_WORD_FORWARD': 1541,
                            'DIVIDE': 1290,
                            'DOWN': 1024,
                            'E': 516,
                            'END': 1029,
                            'EQUAL': 1295,
                            'ESCAPE': 1281,
                            'F': 517,
                            'F1': 768,
                            'F10': 777,
                            'F11': 778,
                            'F12': 779,
                            'F13': 780,
                            'F14': 781,
                            'F15': 782,
                            'F16': 783,
                            'F17': 784,
                            'F18': 785,
                            'F19': 786,
                            'F2': 769,
                            'F20': 787,
                            'F21': 788,
                            'F22': 789,
                            'F23': 790,
                            'F24': 791,
                            'F25': 792,
                            'F26': 793,
                            'F3': 770,
                            'F4': 771,
                            'F5': 772,
                            'F6': 773,
                            'F7': 774,
                            'F8': 775,
                            'F9': 776,
                            'FIND': 1302,
                            'FRONT': 1304,
                            'G': 518,
                            'GREATER': 1294,
                            'H': 519,
                            'HANGUL_HANJA': 1308,
                            'HELP': 1306,
                            'HOME': 1028,
                            'I': 520,
                            'INSERT': 1285,
                            'INSERT_LINEBREAK': 1542,
                            'INSERT_PARAGRAPH': 1543,
                            'J': 521,
                            'K': 522,
                            'L': 523,
                            'LEFT': 1026,
                            'LESS': 1293,
                            'M': 524,
                            'MENU': 1307,
                            'MOVE_TO_BEGIN_OF_DOCUMENT': 1560,
                            'MOVE_TO_BEGIN_OF_LINE': 1546,
                            'MOVE_TO_BEGIN_OF_PARAGRAPH': 1548,
                            'MOVE_TO_END_OF_DOCUMENT': 1561,
                            'MOVE_TO_END_OF_LINE': 1547,
                            'MOVE_TO_END_OF_PARAGRAPH': 1549,
                            'MOVE_WORD_BACKWARD': 1544,
                            'MOVE_WORD_FORWARD': 1545,
                            'MULTIPLY': 1289,
                            'N': 525,
                            'NUM0': 256,
                            'NUM1': 257,
                            'NUM2': 258,
                            'NUM3': 259,
                            'NUM4': 260,
                            'NUM5': 261,
                            'NUM6': 262,
                            'NUM7': 263,
                            'NUM8': 264,
                            'NUM9': 265,
                            'NUMBERSIGN': 191,
                            'NUMLOCK': 1313,
                            'O': 526,
                            'OPEN': 1296,
                            'P': 527,
                            'PAGEDOWN': 1031,
                            'PAGEUP': 1030,
                            'PASTE': 1299,
                            'POINT': 1291,
                            'PROPERTIES': 1303,
                            'Q': 528,
                            'QUOTELEFT': 1311,
                            'QUOTERIGHT': 1318,
                            'R': 529,
                            'REPEAT': 1301,
                            'RETURN': 1280,
                            'RIGHT': 1027,
                            'RIGHTCURLYBRACKET': 1319,
                            'S': 530,
                            'SCROLLLOCK': 1314,
                            'SELECT_ALL': 1557,
                            'SELECT_BACKWARD': 1550,
                            'SELECT_FORWARD': 1551,
                            'SELECT_LINE': 1555,
                            'SELECT_PARAGRAPH': 1556,
                            'SELECT_TO_BEGIN_OF_DOCUMENT': 1562,
                            'SELECT_TO_BEGIN_OF_LINE': 1558,
                            'SELECT_TO_BEGIN_OF_PARAGRAPH': 1564,
                            'SELECT_TO_END_OF_DOCUMENT': 1563,
                            'SELECT_TO_END_OF_LINE': 1559,
                            'SELECT_TO_END_OF_PARAGRAPH': 1565,
                            'SELECT_WORD': 1554,
                            'SELECT_WORD_BACKWARD': 1552,
                            'SELECT_WORD_FORWARD': 1553,
                            'SEMICOLON': 1317,
                            'SPACE': 1284,
                            'SUBTRACT': 1288,
                            'T': 531,
                            'TAB': 1282,
                            'TILDE': 1310,
                            'U': 532,
                            'UNDO': 1300,
                            'UP': 1025,
                            'V': 533,
                            'W': 534,
                            'X': 535,
                            'XF86BACK': 166,
                            'XF86FORWARD': 167,
                            'Y': 536,
                            'Z': 537
                        },
                        'KeyFunction': {
                            'CLOSE': 6,
                            'COPY': 9,
                            'CUT': 8,
                            'DELETE': 13,
                            'DONTKNOW': 0,
                            'FIND': 15,
                            'FINDBACKWARD': 16,
                            'FRONT': 18,
                            'NEW': 1,
                            'OPEN': 2,
                            'PASTE': 10,
                            'PRINT': 5,
                            'PROPERTIES': 17,
                            'QUIT': 7,
                            'REDO': 12,
                            'REPEAT': 14,
                            'SAVE': 3,
                            'SAVEAS': 4,
                            'UNDO': 11
                        },
                        'KeyGroup': {
                            'ALPHA': 512,
                            'CURSOR': 1024,
                            'FKEYS': 768,
                            'MISC': 1280,
                            'NUM': 256,
                            'TYPE': 3840
                        },
                        'KeyModifier': {
                            'MOD1': 2,
                            'MOD2': 4,
                            'MOD3': 8,
                            'SHIFT': 1
                        },
                        'LineEndFormat': {
                            'CARRIAGE_RETURN': 0,
                            'CARRIAGE_RETURN_LINE_FEED': 2,
                            'LINE_FEED': 1
                        },
                        'MenuBar': {
                            'create': instance.uno_Function_com$sun$star$awt$MenuBar$$create
                        },
                        'MenuItemStyle': {
                            'AUTOCHECK': 4,
                            'CHECKABLE': 1,
                            'RADIOCHECK': 2
                        },
                        'MessageBoxButtons': {
                            'BUTTONS_ABORT_IGNORE_RETRY': 6,
                            'BUTTONS_OK': 1,
                            'BUTTONS_OK_CANCEL': 2,
                            'BUTTONS_RETRY_CANCEL': 5,
                            'BUTTONS_YES_NO': 3,
                            'BUTTONS_YES_NO_CANCEL': 4,
                            'DEFAULT_BUTTON_CANCEL': 131072,
                            'DEFAULT_BUTTON_IGNORE': 393216,
                            'DEFAULT_BUTTON_NO': 327680,
                            'DEFAULT_BUTTON_OK': 65536,
                            'DEFAULT_BUTTON_RETRY': 196608,
                            'DEFAULT_BUTTON_YES': 262144
                        },
                        'MessageBoxResults': {
                            'CANCEL': 0,
                            'IGNORE': 5,
                            'NO': 3,
                            'OK': 1,
                            'RETRY': 4,
                            'YES': 2
                        },
                        'MouseButton': {
                            'LEFT': 1,
                            'MIDDLE': 4,
                            'RIGHT': 2
                        },
                        'MouseWheelBehavior': {
                            'SCROLL_ALWAYS': 2,
                            'SCROLL_DISABLED': 0,
                            'SCROLL_FOCUS_ONLY': 1
                        },
                        'Pointer': {
                            'create': instance.uno_Function_com$sun$star$awt$Pointer$$create
                        },
                        'PopupMenu': {
                            'create': instance.uno_Function_com$sun$star$awt$PopupMenu$$create
                        },
                        'PopupMenuDirection': {
                            'EXECUTE_DEFAULT': 0,
                            'EXECUTE_DOWN': 1,
                            'EXECUTE_LEFT': 4,
                            'EXECUTE_RIGHT': 8,
                            'EXECUTE_UP': 2
                        },
                        'PosSize': {
                            'HEIGHT': 8,
                            'POS': 3,
                            'POSSIZE': 15,
                            'SIZE': 12,
                            'WIDTH': 4,
                            'X': 1,
                            'Y': 2
                        },
                        'PrinterServer': {
                            'create': instance.uno_Function_com$sun$star$awt$PrinterServer$$create
                        },
                        'ScrollBarOrientation': {
                            'HORIZONTAL': 0,
                            'VERTICAL': 1
                        },
                        'Style': {
                            'DIALOG': 1,
                            'FRAME': 0
                        },
                        'SystemPointer': {
                            'ARROW': 0,
                            'CHAIN': 70,
                            'CHAIN_NOTALLOWED': 71,
                            'CHART': 65,
                            'COPYDATA': 41,
                            'COPYDATALINK': 44,
                            'COPYFILE': 46,
                            'COPYFILELINK': 49,
                            'COPYFILES': 51,
                            'CROOK': 36,
                            'CROP': 37,
                            'CROSS': 5,
                            'DETECTIVE': 66,
                            'DRAW_ARC': 57,
                            'DRAW_BEZIER': 56,
                            'DRAW_CAPTION': 64,
                            'DRAW_CIRCLECUT': 59,
                            'DRAW_CONNECT': 62,
                            'DRAW_ELLIPSE': 60,
                            'DRAW_FREEHAND': 61,
                            'DRAW_LINE': 53,
                            'DRAW_PIE': 58,
                            'DRAW_POLYGON': 55,
                            'DRAW_RECT': 54,
                            'DRAW_TEXT': 63,
                            'ESIZE': 10,
                            'FILL': 31,
                            'HAND': 27,
                            'HELP': 4,
                            'HSHEAR': 33,
                            'HSIZEBAR': 25,
                            'HSPLIT': 23,
                            'INVISIBLE': 1,
                            'LINKDATA': 42,
                            'LINKFILE': 47,
                            'MAGNIFY': 30,
                            'MIRROR': 35,
                            'MOVE': 6,
                            'MOVEBEZIERWEIGHT': 39,
                            'MOVEDATA': 40,
                            'MOVEDATALINK': 43,
                            'MOVEFILE': 45,
                            'MOVEFILELINK': 48,
                            'MOVEFILES': 50,
                            'MOVEPOINT': 38,
                            'NESIZE': 12,
                            'NOTALLOWED': 52,
                            'NSIZE': 7,
                            'NWSIZE': 11,
                            'PEN': 29,
                            'PIVOT_COL': 67,
                            'PIVOT_FIELD': 69,
                            'PIVOT_ROW': 68,
                            'REFHAND': 28,
                            'ROTATE': 32,
                            'SESIZE': 14,
                            'SSIZE': 8,
                            'SWSIZE': 13,
                            'TEXT': 3,
                            'VSHEAR': 34,
                            'VSIZEBAR': 26,
                            'VSPLIT': 24,
                            'WAIT': 2,
                            'WINDOW_ESIZE': 18,
                            'WINDOW_NESIZE': 20,
                            'WINDOW_NSIZE': 15,
                            'WINDOW_NWSIZE': 19,
                            'WINDOW_SESIZE': 22,
                            'WINDOW_SSIZE': 16,
                            'WINDOW_SWSIZE': 21,
                            'WINDOW_WSIZE': 17,
                            'WSIZE': 9
                        },
                        'TabController': {
                            'create': instance.uno_Function_com$sun$star$awt$TabController$$create
                        },
                        'TextAlign': {
                            'CENTER': 1,
                            'LEFT': 0,
                            'RIGHT': 2
                        },
                        'Toolkit': {
                            'create': instance.uno_Function_com$sun$star$awt$Toolkit$$create
                        },
                        'UnoControlDialog': {
                            'create': instance.uno_Function_com$sun$star$awt$UnoControlDialog$$create
                        },
                        'UnoControlDialogModelProvider': {
                            'create': instance.uno_Function_com$sun$star$awt$UnoControlDialogModelProvider$$create
                        },
                        'VclWindowPeerAttribute': {
                            'AUTOHSCROLL': 1073741824,
                            'AUTOVSCROLL': -2147483648,
                            'CENTER': 2048,
                            'CLIPCHILDREN': 524288,
                            'DEFBUTTON': 65536,
                            'DEF_CANCEL': 268435456,
                            'DEF_NO': -2147483648,
                            'DEF_OK': 134217728,
                            'DEF_RETRY': 536870912,
                            'DEF_YES': 1073741824,
                            'DROPDOWN': 32768,
                            'GROUP': 2097152,
                            'HSCROLL': 256,
                            'LEFT': 1024,
                            'NOBORDER': 1048576,
                            'NOLABEL': 536870912,
                            'OK': 4194304,
                            'OK_CANCEL': 8388608,
                            'READONLY': 262144,
                            'RETRY_CANCEL': 67108864,
                            'RIGHT': 4096,
                            'SORT': 16384,
                            'SPIN': 8192,
                            'VSCROLL': 512,
                            'YES_NO': 16777216,
                            'YES_NO_CANCEL': 33554432
                        },
                        'VisualEffect': {
                            'FLAT': 2,
                            'LOOK3D': 1,
                            'NONE': 0
                        },
                        'WindowAttribute': {
                            'BORDER': 16,
                            'CLOSEABLE': 128,
                            'FULLSIZE': 2,
                            'MINSIZE': 8,
                            'MOVEABLE': 64,
                            'NODECORATION': 512,
                            'OPTIMUMSIZE': 4,
                            'SHOW': 1,
                            'SIZEABLE': 32,
                            'SYSTEMDEPENDENT': 256
                        },
                        'grid': {
                            'GridColumnEvent': instance.uno_Type_com$sun$star$awt$grid$GridColumnEvent,
                            'GridDataEvent': instance.uno_Type_com$sun$star$awt$grid$GridDataEvent,
                            'GridInvalidDataException': instance.uno_Type_com$sun$star$awt$grid$GridInvalidDataException,
                            'GridInvalidModelException': instance.uno_Type_com$sun$star$awt$grid$GridInvalidModelException,
                            'GridSelectionEvent': instance.uno_Type_com$sun$star$awt$grid$GridSelectionEvent,
                            'XGridColumn': instance.uno_Type_com$sun$star$awt$grid$XGridColumn,
                            'XGridColumnListener': instance.uno_Type_com$sun$star$awt$grid$XGridColumnListener,
                            'XGridColumnModel': instance.uno_Type_com$sun$star$awt$grid$XGridColumnModel,
                            'XGridControl': instance.uno_Type_com$sun$star$awt$grid$XGridControl,
                            'XGridDataListener': instance.uno_Type_com$sun$star$awt$grid$XGridDataListener,
                            'XGridDataModel': instance.uno_Type_com$sun$star$awt$grid$XGridDataModel,
                            'XGridRowSelection': instance.uno_Type_com$sun$star$awt$grid$XGridRowSelection,
                            'XGridSelectionListener': instance.uno_Type_com$sun$star$awt$grid$XGridSelectionListener,
                            'XMutableGridDataModel': instance.uno_Type_com$sun$star$awt$grid$XMutableGridDataModel,
                            'XSortableGridData': instance.uno_Type_com$sun$star$awt$grid$XSortableGridData,
                            'XSortableMutableGridDataModel': instance.uno_Type_com$sun$star$awt$grid$XSortableMutableGridDataModel,
                            'DefaultGridColumnModel': {
                                'create': instance.uno_Function_com$sun$star$awt$grid$DefaultGridColumnModel$$create
                            },
                            'DefaultGridDataModel': {
                                'create': instance.uno_Function_com$sun$star$awt$grid$DefaultGridDataModel$$create
                            },
                            'SortableGridDataModel': {
                                'create': instance.uno_Function_com$sun$star$awt$grid$SortableGridDataModel$$create,
                                'createWithCollator': instance.uno_Function_com$sun$star$awt$grid$SortableGridDataModel$$createWithCollator
                            }
                        },
                        'tab': {
                            'TabPageActivatedEvent': instance.uno_Type_com$sun$star$awt$tab$TabPageActivatedEvent,
                            'XTabPage': instance.uno_Type_com$sun$star$awt$tab$XTabPage,
                            'XTabPageContainer': instance.uno_Type_com$sun$star$awt$tab$XTabPageContainer,
                            'XTabPageContainerListener': instance.uno_Type_com$sun$star$awt$tab$XTabPageContainerListener,
                            'XTabPageContainerModel': instance.uno_Type_com$sun$star$awt$tab$XTabPageContainerModel,
                            'XTabPageModel': instance.uno_Type_com$sun$star$awt$tab$XTabPageModel
                        },
                        'tree': {
                            'ExpandVetoException': instance.uno_Type_com$sun$star$awt$tree$ExpandVetoException,
                            'TreeDataModelEvent': instance.uno_Type_com$sun$star$awt$tree$TreeDataModelEvent,
                            'TreeExpansionEvent': instance.uno_Type_com$sun$star$awt$tree$TreeExpansionEvent,
                            'XMutableTreeDataModel': instance.uno_Type_com$sun$star$awt$tree$XMutableTreeDataModel,
                            'XMutableTreeNode': instance.uno_Type_com$sun$star$awt$tree$XMutableTreeNode,
                            'XTreeControl': instance.uno_Type_com$sun$star$awt$tree$XTreeControl,
                            'XTreeDataModel': instance.uno_Type_com$sun$star$awt$tree$XTreeDataModel,
                            'XTreeDataModelListener': instance.uno_Type_com$sun$star$awt$tree$XTreeDataModelListener,
                            'XTreeEditListener': instance.uno_Type_com$sun$star$awt$tree$XTreeEditListener,
                            'XTreeExpansionListener': instance.uno_Type_com$sun$star$awt$tree$XTreeExpansionListener,
                            'XTreeNode': instance.uno_Type_com$sun$star$awt$tree$XTreeNode
                        }
                    },
                    'beans': {
                        'GetDirectPropertyTolerantResult': instance.uno_Type_com$sun$star$beans$GetDirectPropertyTolerantResult,
                        'GetPropertyTolerantResult': instance.uno_Type_com$sun$star$beans$GetPropertyTolerantResult,
                        'IllegalTypeException': instance.uno_Type_com$sun$star$beans$IllegalTypeException,
                        'IntrospectionException': instance.uno_Type_com$sun$star$beans$IntrospectionException,
                        'NamedValue': instance.uno_Type_com$sun$star$beans$NamedValue,
                        'NotRemoveableException': instance.uno_Type_com$sun$star$beans$NotRemoveableException,
                        'Property': instance.uno_Type_com$sun$star$beans$Property,
                        'PropertyChangeEvent': instance.uno_Type_com$sun$star$beans$PropertyChangeEvent,
                        'PropertyExistException': instance.uno_Type_com$sun$star$beans$PropertyExistException,
                        'PropertySetInfoChangeEvent': instance.uno_Type_com$sun$star$beans$PropertySetInfoChangeEvent,
                        'PropertyState': instance.uno_Type_com$sun$star$beans$PropertyState,
                        'PropertyStateChangeEvent': instance.uno_Type_com$sun$star$beans$PropertyStateChangeEvent,
                        'PropertyValue': instance.uno_Type_com$sun$star$beans$PropertyValue,
                        'PropertyVetoException': instance.uno_Type_com$sun$star$beans$PropertyVetoException,
                        'SetPropertyTolerantFailed': instance.uno_Type_com$sun$star$beans$SetPropertyTolerantFailed,
                        'StringPair': instance.uno_Type_com$sun$star$beans$StringPair,
                        'UnknownPropertyException': instance.uno_Type_com$sun$star$beans$UnknownPropertyException,
                        'XExactName': instance.uno_Type_com$sun$star$beans$XExactName,
                        'XFastPropertySet': instance.uno_Type_com$sun$star$beans$XFastPropertySet,
                        'XHierarchicalPropertySet': instance.uno_Type_com$sun$star$beans$XHierarchicalPropertySet,
                        'XHierarchicalPropertySetInfo': instance.uno_Type_com$sun$star$beans$XHierarchicalPropertySetInfo,
                        'XIntrospection': instance.uno_Type_com$sun$star$beans$XIntrospection,
                        'XIntrospectionAccess': instance.uno_Type_com$sun$star$beans$XIntrospectionAccess,
                        'XMaterialHolder': instance.uno_Type_com$sun$star$beans$XMaterialHolder,
                        'XMultiHierarchicalPropertySet': instance.uno_Type_com$sun$star$beans$XMultiHierarchicalPropertySet,
                        'XMultiPropertySet': instance.uno_Type_com$sun$star$beans$XMultiPropertySet,
                        'XMultiPropertyStates': instance.uno_Type_com$sun$star$beans$XMultiPropertyStates,
                        'XPropertiesChangeListener': instance.uno_Type_com$sun$star$beans$XPropertiesChangeListener,
                        'XPropertiesChangeNotifier': instance.uno_Type_com$sun$star$beans$XPropertiesChangeNotifier,
                        'XProperty': instance.uno_Type_com$sun$star$beans$XProperty,
                        'XPropertyAccess': instance.uno_Type_com$sun$star$beans$XPropertyAccess,
                        'XPropertyBag': instance.uno_Type_com$sun$star$beans$XPropertyBag,
                        'XPropertyChangeListener': instance.uno_Type_com$sun$star$beans$XPropertyChangeListener,
                        'XPropertyContainer': instance.uno_Type_com$sun$star$beans$XPropertyContainer,
                        'XPropertySet': instance.uno_Type_com$sun$star$beans$XPropertySet,
                        'XPropertySetInfo': instance.uno_Type_com$sun$star$beans$XPropertySetInfo,
                        'XPropertySetInfoChangeListener': instance.uno_Type_com$sun$star$beans$XPropertySetInfoChangeListener,
                        'XPropertySetInfoChangeNotifier': instance.uno_Type_com$sun$star$beans$XPropertySetInfoChangeNotifier,
                        'XPropertySetOption': instance.uno_Type_com$sun$star$beans$XPropertySetOption,
                        'XPropertyState': instance.uno_Type_com$sun$star$beans$XPropertyState,
                        'XPropertyStateChangeListener': instance.uno_Type_com$sun$star$beans$XPropertyStateChangeListener,
                        'XPropertyWithState': instance.uno_Type_com$sun$star$beans$XPropertyWithState,
                        'XTolerantMultiPropertySet': instance.uno_Type_com$sun$star$beans$XTolerantMultiPropertySet,
                        'XVetoableChangeListener': instance.uno_Type_com$sun$star$beans$XVetoableChangeListener,
                        'theIntrospection': instance.uno_Function_com$sun$star$beans$theIntrospection,
                        'Introspection': {
                            'create': instance.uno_Function_com$sun$star$beans$Introspection$$create
                        },
                        'MethodConcept': {
                            'ALL': -1,
                            'DANGEROUS': 1,
                            'ENUMERATION': 8,
                            'INDEXCONTAINER': 32,
                            'LISTENER': 4,
                            'NAMECONTAINER': 16,
                            'PROPERTY': 2
                        },
                        'PropertyAttribute': {
                            'BOUND': 2,
                            'CONSTRAINED': 4,
                            'MAYBEAMBIGUOUS': 32,
                            'MAYBEDEFAULT': 64,
                            'MAYBEVOID': 1,
                            'OPTIONAL': 256,
                            'READONLY': 16,
                            'REMOVABLE': 128,
                            'REMOVEABLE': 128,
                            'TRANSIENT': 8
                        },
                        'PropertyBag': {
                            'createDefault': instance.uno_Function_com$sun$star$beans$PropertyBag$$createDefault,
                            'createWithTypes': instance.uno_Function_com$sun$star$beans$PropertyBag$$createWithTypes
                        },
                        'PropertyConcept': {
                            'ALL': -1,
                            'ATTRIBUTES': 4,
                            'DANGEROUS': 1,
                            'METHODS': 8,
                            'PROPERTYSET': 2
                        },
                        'PropertySetInfoChange': {
                            'PROPERTY_INSERTED': 0,
                            'PROPERTY_REMOVED': 1
                        },
                        'TolerantPropertySetResultType': {
                            'ILLEGAL_ARGUMENT': 2,
                            'PROPERTY_VETO': 3,
                            'SUCCESS': 0,
                            'UNKNOWN_FAILURE': 5,
                            'UNKNOWN_PROPERTY': 1,
                            'WRAPPED_TARGET': 4
                        }
                    },
                    'bridge': {
                        'BridgeExistsException': instance.uno_Type_com$sun$star$bridge$BridgeExistsException,
                        'InvalidProtocolChangeException': instance.uno_Type_com$sun$star$bridge$InvalidProtocolChangeException,
                        'ProtocolProperty': instance.uno_Type_com$sun$star$bridge$ProtocolProperty,
                        'XBridge': instance.uno_Type_com$sun$star$bridge$XBridge,
                        'XBridgeFactory': instance.uno_Type_com$sun$star$bridge$XBridgeFactory,
                        'XBridgeFactory2': instance.uno_Type_com$sun$star$bridge$XBridgeFactory2,
                        'XBridgeSupplier': instance.uno_Type_com$sun$star$bridge$XBridgeSupplier,
                        'XBridgeSupplier2': instance.uno_Type_com$sun$star$bridge$XBridgeSupplier2,
                        'XInstanceProvider': instance.uno_Type_com$sun$star$bridge$XInstanceProvider,
                        'XProtocolProperties': instance.uno_Type_com$sun$star$bridge$XProtocolProperties,
                        'XUnoUrlResolver': instance.uno_Type_com$sun$star$bridge$XUnoUrlResolver,
                        'BridgeFactory': {
                            'create': instance.uno_Function_com$sun$star$bridge$BridgeFactory$$create
                        },
                        'ModelDependent': {
                            'CORBA': 4,
                            'JAVA': 3,
                            'OLE': 2,
                            'UNO': 1
                        },
                        'UnoUrlResolver': {
                            'create': instance.uno_Function_com$sun$star$bridge$UnoUrlResolver$$create
                        },
                        'oleautomation': {
                            'Currency': instance.uno_Type_com$sun$star$bridge$oleautomation$Currency,
                            'Date': instance.uno_Type_com$sun$star$bridge$oleautomation$Date,
                            'Decimal': instance.uno_Type_com$sun$star$bridge$oleautomation$Decimal,
                            'NamedArgument': instance.uno_Type_com$sun$star$bridge$oleautomation$NamedArgument,
                            'PropertyPutArgument': instance.uno_Type_com$sun$star$bridge$oleautomation$PropertyPutArgument,
                            'SCode': instance.uno_Type_com$sun$star$bridge$oleautomation$SCode,
                            'XAutomationObject': instance.uno_Type_com$sun$star$bridge$oleautomation$XAutomationObject
                        }
                    },
                    'chart': {
                        'ChartAxisArrangeOrderType': instance.uno_Type_com$sun$star$chart$ChartAxisArrangeOrderType,
                        'ChartAxisLabelPosition': instance.uno_Type_com$sun$star$chart$ChartAxisLabelPosition,
                        'ChartAxisMarkPosition': instance.uno_Type_com$sun$star$chart$ChartAxisMarkPosition,
                        'ChartAxisPosition': instance.uno_Type_com$sun$star$chart$ChartAxisPosition,
                        'ChartDataChangeEvent': instance.uno_Type_com$sun$star$chart$ChartDataChangeEvent,
                        'ChartDataChangeType': instance.uno_Type_com$sun$star$chart$ChartDataChangeType,
                        'ChartDataRow': instance.uno_Type_com$sun$star$chart$ChartDataRow,
                        'ChartDataRowSource': instance.uno_Type_com$sun$star$chart$ChartDataRowSource,
                        'ChartDataValue': instance.uno_Type_com$sun$star$chart$ChartDataValue,
                        'ChartErrorCategory': instance.uno_Type_com$sun$star$chart$ChartErrorCategory,
                        'ChartErrorIndicatorType': instance.uno_Type_com$sun$star$chart$ChartErrorIndicatorType,
                        'ChartLegendExpansion': instance.uno_Type_com$sun$star$chart$ChartLegendExpansion,
                        'ChartLegendPosition': instance.uno_Type_com$sun$star$chart$ChartLegendPosition,
                        'ChartRegressionCurveType': instance.uno_Type_com$sun$star$chart$ChartRegressionCurveType,
                        'ChartSeriesAddress': instance.uno_Type_com$sun$star$chart$ChartSeriesAddress,
                        'TimeIncrement': instance.uno_Type_com$sun$star$chart$TimeIncrement,
                        'TimeInterval': instance.uno_Type_com$sun$star$chart$TimeInterval,
                        'X3DDefaultSetter': instance.uno_Type_com$sun$star$chart$X3DDefaultSetter,
                        'X3DDisplay': instance.uno_Type_com$sun$star$chart$X3DDisplay,
                        'XAxis': instance.uno_Type_com$sun$star$chart$XAxis,
                        'XAxisSupplier': instance.uno_Type_com$sun$star$chart$XAxisSupplier,
                        'XAxisXSupplier': instance.uno_Type_com$sun$star$chart$XAxisXSupplier,
                        'XAxisYSupplier': instance.uno_Type_com$sun$star$chart$XAxisYSupplier,
                        'XAxisZSupplier': instance.uno_Type_com$sun$star$chart$XAxisZSupplier,
                        'XChartData': instance.uno_Type_com$sun$star$chart$XChartData,
                        'XChartDataArray': instance.uno_Type_com$sun$star$chart$XChartDataArray,
                        'XChartDataChangeEventListener': instance.uno_Type_com$sun$star$chart$XChartDataChangeEventListener,
                        'XChartDocument': instance.uno_Type_com$sun$star$chart$XChartDocument,
                        'XComplexDescriptionAccess': instance.uno_Type_com$sun$star$chart$XComplexDescriptionAccess,
                        'XDateCategories': instance.uno_Type_com$sun$star$chart$XDateCategories,
                        'XDiagram': instance.uno_Type_com$sun$star$chart$XDiagram,
                        'XDiagramPositioning': instance.uno_Type_com$sun$star$chart$XDiagramPositioning,
                        'XSecondAxisTitleSupplier': instance.uno_Type_com$sun$star$chart$XSecondAxisTitleSupplier,
                        'XStatisticDisplay': instance.uno_Type_com$sun$star$chart$XStatisticDisplay,
                        'XTwoAxisXSupplier': instance.uno_Type_com$sun$star$chart$XTwoAxisXSupplier,
                        'XTwoAxisYSupplier': instance.uno_Type_com$sun$star$chart$XTwoAxisYSupplier,
                        'ChartAxisAssign': {
                            'PRIMARY_Y': 2,
                            'SECONDARY_Y': 4
                        },
                        'ChartAxisMarks': {
                            'INNER': 1,
                            'NONE': 0,
                            'OUTER': 2
                        },
                        'ChartAxisType': {
                            'AUTOMATIC': 0,
                            'CATEGORY': 1,
                            'DATE': 2
                        },
                        'ChartDataCaption': {
                            'CUSTOM': 32,
                            'DATA_SERIES': 64,
                            'FORMAT': 8,
                            'NONE': 0,
                            'PERCENT': 2,
                            'SYMBOL': 16,
                            'TEXT': 4,
                            'VALUE': 1
                        },
                        'ChartSolidType': {
                            'CONE': 2,
                            'CYLINDER': 1,
                            'PYRAMID': 3,
                            'RECTANGULAR_SOLID': 0
                        },
                        'ChartSymbolType': {
                            'AUTO': -2,
                            'BITMAPURL': -1,
                            'NONE': -3,
                            'SYMBOL0': 0,
                            'SYMBOL1': 1,
                            'SYMBOL2': 2,
                            'SYMBOL3': 3,
                            'SYMBOL4': 4,
                            'SYMBOL5': 5,
                            'SYMBOL6': 6,
                            'SYMBOL7': 7
                        },
                        'DataLabelPlacement': {
                            'AVOID_OVERLAP': 0,
                            'BOTTOM': 6,
                            'BOTTOM_LEFT': 5,
                            'BOTTOM_RIGHT': 7,
                            'CENTER': 1,
                            'CUSTOM': 13,
                            'INSIDE': 10,
                            'LEFT': 4,
                            'NEAR_ORIGIN': 12,
                            'OUTSIDE': 11,
                            'RIGHT': 8,
                            'TOP': 2,
                            'TOP_LEFT': 3,
                            'TOP_RIGHT': 9
                        },
                        'ErrorBarStyle': {
                            'ABSOLUTE': 3,
                            'ERROR_MARGIN': 5,
                            'FROM_DATA': 7,
                            'NONE': 0,
                            'RELATIVE': 4,
                            'STANDARD_DEVIATION': 2,
                            'STANDARD_ERROR': 6,
                            'VARIANCE': 1
                        },
                        'MissingValueTreatment': {
                            'CONTINUE': 2,
                            'LEAVE_GAP': 0,
                            'USE_ZERO': 1
                        },
                        'TimeUnit': {
                            'DAY': 0,
                            'MONTH': 1,
                            'YEAR': 2
                        }
                    },
                    'chart2': {
                        'AxisOrientation': instance.uno_Type_com$sun$star$chart2$AxisOrientation,
                        'CurveStyle': instance.uno_Type_com$sun$star$chart2$CurveStyle,
                        'DataPointCustomLabelFieldType': instance.uno_Type_com$sun$star$chart2$DataPointCustomLabelFieldType,
                        'DataPointLabel': instance.uno_Type_com$sun$star$chart2$DataPointLabel,
                        'FillBitmap': instance.uno_Type_com$sun$star$chart2$FillBitmap,
                        'IncrementData': instance.uno_Type_com$sun$star$chart2$IncrementData,
                        'LegendPosition': instance.uno_Type_com$sun$star$chart2$LegendPosition,
                        'LightSource': instance.uno_Type_com$sun$star$chart2$LightSource,
                        'PieChartOffsetMode': instance.uno_Type_com$sun$star$chart2$PieChartOffsetMode,
                        'PieChartSubType': instance.uno_Type_com$sun$star$chart2$PieChartSubType,
                        'RelativePosition': instance.uno_Type_com$sun$star$chart2$RelativePosition,
                        'RelativeSize': instance.uno_Type_com$sun$star$chart2$RelativeSize,
                        'ScaleData': instance.uno_Type_com$sun$star$chart2$ScaleData,
                        'StackingDirection': instance.uno_Type_com$sun$star$chart2$StackingDirection,
                        'SubIncrement': instance.uno_Type_com$sun$star$chart2$SubIncrement,
                        'Symbol': instance.uno_Type_com$sun$star$chart2$Symbol,
                        'SymbolStyle': instance.uno_Type_com$sun$star$chart2$SymbolStyle,
                        'TransparencyStyle': instance.uno_Type_com$sun$star$chart2$TransparencyStyle,
                        'XAnyDescriptionAccess': instance.uno_Type_com$sun$star$chart2$XAnyDescriptionAccess,
                        'XAxis': instance.uno_Type_com$sun$star$chart2$XAxis,
                        'XChartDocument': instance.uno_Type_com$sun$star$chart2$XChartDocument,
                        'XChartShape': instance.uno_Type_com$sun$star$chart2$XChartShape,
                        'XChartShapeContainer': instance.uno_Type_com$sun$star$chart2$XChartShapeContainer,
                        'XChartType': instance.uno_Type_com$sun$star$chart2$XChartType,
                        'XChartTypeContainer': instance.uno_Type_com$sun$star$chart2$XChartTypeContainer,
                        'XChartTypeManager': instance.uno_Type_com$sun$star$chart2$XChartTypeManager,
                        'XChartTypeTemplate': instance.uno_Type_com$sun$star$chart2$XChartTypeTemplate,
                        'XColorScheme': instance.uno_Type_com$sun$star$chart2$XColorScheme,
                        'XCoordinateSystem': instance.uno_Type_com$sun$star$chart2$XCoordinateSystem,
                        'XCoordinateSystemContainer': instance.uno_Type_com$sun$star$chart2$XCoordinateSystemContainer,
                        'XDataPointCustomLabelField': instance.uno_Type_com$sun$star$chart2$XDataPointCustomLabelField,
                        'XDataProviderAccess': instance.uno_Type_com$sun$star$chart2$XDataProviderAccess,
                        'XDataSeries': instance.uno_Type_com$sun$star$chart2$XDataSeries,
                        'XDataSeriesContainer': instance.uno_Type_com$sun$star$chart2$XDataSeriesContainer,
                        'XDataTable': instance.uno_Type_com$sun$star$chart2$XDataTable,
                        'XDefaultSizeTransmitter': instance.uno_Type_com$sun$star$chart2$XDefaultSizeTransmitter,
                        'XDiagram': instance.uno_Type_com$sun$star$chart2$XDiagram,
                        'XDiagramProvider': instance.uno_Type_com$sun$star$chart2$XDiagramProvider,
                        'XFormattedString': instance.uno_Type_com$sun$star$chart2$XFormattedString,
                        'XFormattedString2': instance.uno_Type_com$sun$star$chart2$XFormattedString2,
                        'XInternalDataProvider': instance.uno_Type_com$sun$star$chart2$XInternalDataProvider,
                        'XLabeled': instance.uno_Type_com$sun$star$chart2$XLabeled,
                        'XLegend': instance.uno_Type_com$sun$star$chart2$XLegend,
                        'XRegressionCurve': instance.uno_Type_com$sun$star$chart2$XRegressionCurve,
                        'XRegressionCurveCalculator': instance.uno_Type_com$sun$star$chart2$XRegressionCurveCalculator,
                        'XRegressionCurveContainer': instance.uno_Type_com$sun$star$chart2$XRegressionCurveContainer,
                        'XScaling': instance.uno_Type_com$sun$star$chart2$XScaling,
                        'XTarget': instance.uno_Type_com$sun$star$chart2$XTarget,
                        'XTimeBased': instance.uno_Type_com$sun$star$chart2$XTimeBased,
                        'XTitle': instance.uno_Type_com$sun$star$chart2$XTitle,
                        'XTitled': instance.uno_Type_com$sun$star$chart2$XTitled,
                        'AxisType': {
                            'CATEGORY': 2,
                            'DATE': 4,
                            'PERCENT': 1,
                            'REALNUMBER': 0,
                            'SERIES': 3
                        },
                        'CartesianCoordinateSystem2d': {
                            'create': instance.uno_Function_com$sun$star$chart2$CartesianCoordinateSystem2d$$create
                        },
                        'CartesianCoordinateSystem3d': {
                            'create': instance.uno_Function_com$sun$star$chart2$CartesianCoordinateSystem3d$$create
                        },
                        'DataPointCustomLabelField': {
                            'create': instance.uno_Function_com$sun$star$chart2$DataPointCustomLabelField$$create
                        },
                        'DataPointGeometry3D': {
                            'CONE': 2,
                            'CUBOID': 0,
                            'CYLINDER': 1,
                            'PYRAMID': 3
                        },
                        'ExponentialRegressionCurve': {
                            'create': instance.uno_Function_com$sun$star$chart2$ExponentialRegressionCurve$$create
                        },
                        'ExponentialScaling': {
                            'create': instance.uno_Function_com$sun$star$chart2$ExponentialScaling$$create
                        },
                        'FormattedString': {
                            'create': instance.uno_Function_com$sun$star$chart2$FormattedString$$create
                        },
                        'LinearRegressionCurve': {
                            'create': instance.uno_Function_com$sun$star$chart2$LinearRegressionCurve$$create
                        },
                        'LinearScaling': {
                            'create': instance.uno_Function_com$sun$star$chart2$LinearScaling$$create
                        },
                        'LogarithmicRegressionCurve': {
                            'create': instance.uno_Function_com$sun$star$chart2$LogarithmicRegressionCurve$$create
                        },
                        'LogarithmicScaling': {
                            'create': instance.uno_Function_com$sun$star$chart2$LogarithmicScaling$$create
                        },
                        'MovingAverageRegressionCurve': {
                            'create': instance.uno_Function_com$sun$star$chart2$MovingAverageRegressionCurve$$create
                        },
                        'MovingAverageType': {
                            'AveragedAbscissa': 3,
                            'Central': 2,
                            'Prior': 1
                        },
                        'PolarCoordinateSystem2d': {
                            'create': instance.uno_Function_com$sun$star$chart2$PolarCoordinateSystem2d$$create
                        },
                        'PolarCoordinateSystem3d': {
                            'create': instance.uno_Function_com$sun$star$chart2$PolarCoordinateSystem3d$$create
                        },
                        'PolynomialRegressionCurve': {
                            'create': instance.uno_Function_com$sun$star$chart2$PolynomialRegressionCurve$$create
                        },
                        'PotentialRegressionCurve': {
                            'create': instance.uno_Function_com$sun$star$chart2$PotentialRegressionCurve$$create
                        },
                        'PowerScaling': {
                            'create': instance.uno_Function_com$sun$star$chart2$PowerScaling$$create
                        },
                        'RegressionEquation': {
                            'create': instance.uno_Function_com$sun$star$chart2$RegressionEquation$$create
                        },
                        'Scaling': {
                            'create': instance.uno_Function_com$sun$star$chart2$Scaling$$create
                        },
                        'TickmarkStyle': {
                            'INNER': 1,
                            'NONE': 0,
                            'OUTER': 2
                        },
                        'data': {
                            'HighlightedRange': instance.uno_Type_com$sun$star$chart2$data$HighlightedRange,
                            'LabelOrigin': instance.uno_Type_com$sun$star$chart2$data$LabelOrigin,
                            'PivotTableFieldEntry': instance.uno_Type_com$sun$star$chart2$data$PivotTableFieldEntry,
                            'XDataProvider': instance.uno_Type_com$sun$star$chart2$data$XDataProvider,
                            'XDataReceiver': instance.uno_Type_com$sun$star$chart2$data$XDataReceiver,
                            'XDataSequence': instance.uno_Type_com$sun$star$chart2$data$XDataSequence,
                            'XDataSink': instance.uno_Type_com$sun$star$chart2$data$XDataSink,
                            'XDataSource': instance.uno_Type_com$sun$star$chart2$data$XDataSource,
                            'XDatabaseDataProvider': instance.uno_Type_com$sun$star$chart2$data$XDatabaseDataProvider,
                            'XLabeledDataSequence': instance.uno_Type_com$sun$star$chart2$data$XLabeledDataSequence,
                            'XLabeledDataSequence2': instance.uno_Type_com$sun$star$chart2$data$XLabeledDataSequence2,
                            'XNumericalDataSequence': instance.uno_Type_com$sun$star$chart2$data$XNumericalDataSequence,
                            'XPivotTableDataProvider': instance.uno_Type_com$sun$star$chart2$data$XPivotTableDataProvider,
                            'XRangeHighlighter': instance.uno_Type_com$sun$star$chart2$data$XRangeHighlighter,
                            'XRangeXMLConversion': instance.uno_Type_com$sun$star$chart2$data$XRangeXMLConversion,
                            'XSheetDataProvider': instance.uno_Type_com$sun$star$chart2$data$XSheetDataProvider,
                            'XTextualDataSequence': instance.uno_Type_com$sun$star$chart2$data$XTextualDataSequence,
                            'DatabaseDataProvider': {
                                'createWithConnection': instance.uno_Function_com$sun$star$chart2$data$DatabaseDataProvider$$createWithConnection
                            },
                            'LabeledDataSequence': {
                                'create': instance.uno_Function_com$sun$star$chart2$data$LabeledDataSequence$$create
                            }
                        }
                    },
                    'configuration': {
                        'CannotLoadConfigurationException': instance.uno_Type_com$sun$star$configuration$CannotLoadConfigurationException,
                        'CorruptedConfigurationException': instance.uno_Type_com$sun$star$configuration$CorruptedConfigurationException,
                        'CorruptedUIConfigurationException': instance.uno_Type_com$sun$star$configuration$CorruptedUIConfigurationException,
                        'InstallationIncompleteException': instance.uno_Type_com$sun$star$configuration$InstallationIncompleteException,
                        'InvalidBootstrapFileException': instance.uno_Type_com$sun$star$configuration$InvalidBootstrapFileException,
                        'MissingBootstrapFileException': instance.uno_Type_com$sun$star$configuration$MissingBootstrapFileException,
                        'Update': instance.uno_Function_com$sun$star$configuration$Update,
                        'XDocumentation': instance.uno_Type_com$sun$star$configuration$XDocumentation,
                        'XReadWriteAccess': instance.uno_Type_com$sun$star$configuration$XReadWriteAccess,
                        'XTemplateContainer': instance.uno_Type_com$sun$star$configuration$XTemplateContainer,
                        'XTemplateInstance': instance.uno_Type_com$sun$star$configuration$XTemplateInstance,
                        'XUpdate': instance.uno_Type_com$sun$star$configuration$XUpdate,
                        'theDefaultProvider': instance.uno_Function_com$sun$star$configuration$theDefaultProvider,
                        'ReadOnlyAccess': {
                            'create': instance.uno_Function_com$sun$star$configuration$ReadOnlyAccess$$create
                        },
                        'ReadWriteAccess': {
                            'create': instance.uno_Function_com$sun$star$configuration$ReadWriteAccess$$create
                        },
                        'backend': {
                            'AuthenticationFailedException': instance.uno_Type_com$sun$star$configuration$backend$AuthenticationFailedException,
                            'BackendAccessException': instance.uno_Type_com$sun$star$configuration$backend$BackendAccessException,
                            'BackendSetupException': instance.uno_Type_com$sun$star$configuration$backend$BackendSetupException,
                            'CannotConnectException': instance.uno_Type_com$sun$star$configuration$backend$CannotConnectException,
                            'ComponentChangeEvent': instance.uno_Type_com$sun$star$configuration$backend$ComponentChangeEvent,
                            'ConnectionLostException': instance.uno_Type_com$sun$star$configuration$backend$ConnectionLostException,
                            'InsufficientAccessRightsException': instance.uno_Type_com$sun$star$configuration$backend$InsufficientAccessRightsException,
                            'InvalidAuthenticationMechanismException': instance.uno_Type_com$sun$star$configuration$backend$InvalidAuthenticationMechanismException,
                            'MalformedDataException': instance.uno_Type_com$sun$star$configuration$backend$MalformedDataException,
                            'MergeRecoveryRequest': instance.uno_Type_com$sun$star$configuration$backend$MergeRecoveryRequest,
                            'PropertyInfo': instance.uno_Type_com$sun$star$configuration$backend$PropertyInfo,
                            'StratumCreationException': instance.uno_Type_com$sun$star$configuration$backend$StratumCreationException,
                            'TemplateIdentifier': instance.uno_Type_com$sun$star$configuration$backend$TemplateIdentifier,
                            'XBackend': instance.uno_Type_com$sun$star$configuration$backend$XBackend,
                            'XBackendChangesListener': instance.uno_Type_com$sun$star$configuration$backend$XBackendChangesListener,
                            'XBackendChangesNotifier': instance.uno_Type_com$sun$star$configuration$backend$XBackendChangesNotifier,
                            'XBackendEntities': instance.uno_Type_com$sun$star$configuration$backend$XBackendEntities,
                            'XCompositeLayer': instance.uno_Type_com$sun$star$configuration$backend$XCompositeLayer,
                            'XLayer': instance.uno_Type_com$sun$star$configuration$backend$XLayer,
                            'XLayerContentDescriber': instance.uno_Type_com$sun$star$configuration$backend$XLayerContentDescriber,
                            'XLayerHandler': instance.uno_Type_com$sun$star$configuration$backend$XLayerHandler,
                            'XLayerImporter': instance.uno_Type_com$sun$star$configuration$backend$XLayerImporter,
                            'XMultiLayerStratum': instance.uno_Type_com$sun$star$configuration$backend$XMultiLayerStratum,
                            'XSchema': instance.uno_Type_com$sun$star$configuration$backend$XSchema,
                            'XSchemaHandler': instance.uno_Type_com$sun$star$configuration$backend$XSchemaHandler,
                            'XSchemaSupplier': instance.uno_Type_com$sun$star$configuration$backend$XSchemaSupplier,
                            'XSingleLayerStratum': instance.uno_Type_com$sun$star$configuration$backend$XSingleLayerStratum,
                            'XUpdatableLayer': instance.uno_Type_com$sun$star$configuration$backend$XUpdatableLayer,
                            'XUpdateHandler': instance.uno_Type_com$sun$star$configuration$backend$XUpdateHandler,
                            'XVersionedSchemaSupplier': instance.uno_Type_com$sun$star$configuration$backend$XVersionedSchemaSupplier,
                            'NodeAttribute': {
                                'FINALIZED': 256,
                                'FUSE': 2048,
                                'MANDATORY': 512,
                                'MASK': 32512,
                                'READONLY': 1024
                            },
                            'SchemaAttribute': {
                                'EXTENSIBLE': 4,
                                'LOCALIZED': 2,
                                'MASK': 255,
                                'REQUIRED': 1
                            },
                            'xml': {
                            }
                        },
                        'bootstrap': {
                        }
                    },
                    'connection': {
                        'AlreadyAcceptingException': instance.uno_Type_com$sun$star$connection$AlreadyAcceptingException,
                        'ConnectionSetupException': instance.uno_Type_com$sun$star$connection$ConnectionSetupException,
                        'NoConnectException': instance.uno_Type_com$sun$star$connection$NoConnectException,
                        'SocketPermission': instance.uno_Type_com$sun$star$connection$SocketPermission,
                        'XAcceptor': instance.uno_Type_com$sun$star$connection$XAcceptor,
                        'XConnection': instance.uno_Type_com$sun$star$connection$XConnection,
                        'XConnection2': instance.uno_Type_com$sun$star$connection$XConnection2,
                        'XConnectionBroadcaster': instance.uno_Type_com$sun$star$connection$XConnectionBroadcaster,
                        'XConnector': instance.uno_Type_com$sun$star$connection$XConnector,
                        'Acceptor': {
                            'create': instance.uno_Function_com$sun$star$connection$Acceptor$$create
                        },
                        'Connector': {
                            'create': instance.uno_Function_com$sun$star$connection$Connector$$create
                        }
                    },
                    'container': {
                        'ContainerEvent': instance.uno_Type_com$sun$star$container$ContainerEvent,
                        'ElementExistException': instance.uno_Type_com$sun$star$container$ElementExistException,
                        'NoSuchElementException': instance.uno_Type_com$sun$star$container$NoSuchElementException,
                        'XChild': instance.uno_Type_com$sun$star$container$XChild,
                        'XComponentEnumeration': instance.uno_Type_com$sun$star$container$XComponentEnumeration,
                        'XComponentEnumerationAccess': instance.uno_Type_com$sun$star$container$XComponentEnumerationAccess,
                        'XContainer': instance.uno_Type_com$sun$star$container$XContainer,
                        'XContainerApproveBroadcaster': instance.uno_Type_com$sun$star$container$XContainerApproveBroadcaster,
                        'XContainerApproveListener': instance.uno_Type_com$sun$star$container$XContainerApproveListener,
                        'XContainerListener': instance.uno_Type_com$sun$star$container$XContainerListener,
                        'XContainerQuery': instance.uno_Type_com$sun$star$container$XContainerQuery,
                        'XContentEnumerationAccess': instance.uno_Type_com$sun$star$container$XContentEnumerationAccess,
                        'XElementAccess': instance.uno_Type_com$sun$star$container$XElementAccess,
                        'XEnumerableMap': instance.uno_Type_com$sun$star$container$XEnumerableMap,
                        'XEnumeration': instance.uno_Type_com$sun$star$container$XEnumeration,
                        'XEnumerationAccess': instance.uno_Type_com$sun$star$container$XEnumerationAccess,
                        'XHierarchicalName': instance.uno_Type_com$sun$star$container$XHierarchicalName,
                        'XHierarchicalNameAccess': instance.uno_Type_com$sun$star$container$XHierarchicalNameAccess,
                        'XHierarchicalNameContainer': instance.uno_Type_com$sun$star$container$XHierarchicalNameContainer,
                        'XHierarchicalNameReplace': instance.uno_Type_com$sun$star$container$XHierarchicalNameReplace,
                        'XIdentifierAccess': instance.uno_Type_com$sun$star$container$XIdentifierAccess,
                        'XIdentifierContainer': instance.uno_Type_com$sun$star$container$XIdentifierContainer,
                        'XIdentifierReplace': instance.uno_Type_com$sun$star$container$XIdentifierReplace,
                        'XImplicitIDAccess': instance.uno_Type_com$sun$star$container$XImplicitIDAccess,
                        'XImplicitIDContainer': instance.uno_Type_com$sun$star$container$XImplicitIDContainer,
                        'XImplicitIDReplace': instance.uno_Type_com$sun$star$container$XImplicitIDReplace,
                        'XIndexAccess': instance.uno_Type_com$sun$star$container$XIndexAccess,
                        'XIndexContainer': instance.uno_Type_com$sun$star$container$XIndexContainer,
                        'XIndexReplace': instance.uno_Type_com$sun$star$container$XIndexReplace,
                        'XMap': instance.uno_Type_com$sun$star$container$XMap,
                        'XNameAccess': instance.uno_Type_com$sun$star$container$XNameAccess,
                        'XNameContainer': instance.uno_Type_com$sun$star$container$XNameContainer,
                        'XNameReplace': instance.uno_Type_com$sun$star$container$XNameReplace,
                        'XNamed': instance.uno_Type_com$sun$star$container$XNamed,
                        'XSet': instance.uno_Type_com$sun$star$container$XSet,
                        'XStringKeyMap': instance.uno_Type_com$sun$star$container$XStringKeyMap,
                        'XUniqueIDAccess': instance.uno_Type_com$sun$star$container$XUniqueIDAccess,
                        'EnumerableMap': {
                            'create': instance.uno_Function_com$sun$star$container$EnumerableMap$$create,
                            'createImmutable': instance.uno_Function_com$sun$star$container$EnumerableMap$$createImmutable
                        }
                    },
                    'cui': {
                        'AsynchronousColorPicker': {
                            'createWithParent': instance.uno_Function_com$sun$star$cui$AsynchronousColorPicker$$createWithParent
                        },
                        'ColorPicker': {
                            'createWithParent': instance.uno_Function_com$sun$star$cui$ColorPicker$$createWithParent
                        },
                        'GetCreateDialogFactoryService': {
                            'create': instance.uno_Function_com$sun$star$cui$GetCreateDialogFactoryService$$create
                        }
                    },
                    'datatransfer': {
                        'DataFlavor': instance.uno_Type_com$sun$star$datatransfer$DataFlavor,
                        'UnsupportedFlavorException': instance.uno_Type_com$sun$star$datatransfer$UnsupportedFlavorException,
                        'XDataFormatTranslator': instance.uno_Type_com$sun$star$datatransfer$XDataFormatTranslator,
                        'XMimeContentType': instance.uno_Type_com$sun$star$datatransfer$XMimeContentType,
                        'XMimeContentTypeFactory': instance.uno_Type_com$sun$star$datatransfer$XMimeContentTypeFactory,
                        'XSystemTransferable': instance.uno_Type_com$sun$star$datatransfer$XSystemTransferable,
                        'XTransferDataAccess': instance.uno_Type_com$sun$star$datatransfer$XTransferDataAccess,
                        'XTransferable': instance.uno_Type_com$sun$star$datatransfer$XTransferable,
                        'XTransferable2': instance.uno_Type_com$sun$star$datatransfer$XTransferable2,
                        'XTransferableEx': instance.uno_Type_com$sun$star$datatransfer$XTransferableEx,
                        'XTransferableSource': instance.uno_Type_com$sun$star$datatransfer$XTransferableSource,
                        'XTransferableSupplier': instance.uno_Type_com$sun$star$datatransfer$XTransferableSupplier,
                        'XTransferableTextSupplier': instance.uno_Type_com$sun$star$datatransfer$XTransferableTextSupplier,
                        'DataFormatTranslator': {
                            'create': instance.uno_Function_com$sun$star$datatransfer$DataFormatTranslator$$create
                        },
                        'MimeContentTypeFactory': {
                            'create': instance.uno_Function_com$sun$star$datatransfer$MimeContentTypeFactory$$create
                        },
                        'clipboard': {
                            'ClipboardEvent': instance.uno_Type_com$sun$star$datatransfer$clipboard$ClipboardEvent,
                            'XClipboard': instance.uno_Type_com$sun$star$datatransfer$clipboard$XClipboard,
                            'XClipboardEx': instance.uno_Type_com$sun$star$datatransfer$clipboard$XClipboardEx,
                            'XClipboardFactory': instance.uno_Type_com$sun$star$datatransfer$clipboard$XClipboardFactory,
                            'XClipboardListener': instance.uno_Type_com$sun$star$datatransfer$clipboard$XClipboardListener,
                            'XClipboardManager': instance.uno_Type_com$sun$star$datatransfer$clipboard$XClipboardManager,
                            'XClipboardNotifier': instance.uno_Type_com$sun$star$datatransfer$clipboard$XClipboardNotifier,
                            'XClipboardOwner': instance.uno_Type_com$sun$star$datatransfer$clipboard$XClipboardOwner,
                            'XFlushableClipboard': instance.uno_Type_com$sun$star$datatransfer$clipboard$XFlushableClipboard,
                            'XSystemClipboard': instance.uno_Type_com$sun$star$datatransfer$clipboard$XSystemClipboard,
                            'LokClipboard': {
                                'create': instance.uno_Function_com$sun$star$datatransfer$clipboard$LokClipboard$$create
                            },
                            'RenderingCapabilities': {
                                'Delayed': 1,
                                'Persistant': 2,
                                'Persistent': 2
                            },
                            'SystemClipboard': {
                                'create': instance.uno_Function_com$sun$star$datatransfer$clipboard$SystemClipboard$$create
                            }
                        },
                        'dnd': {
                            'DragGestureEvent': instance.uno_Type_com$sun$star$datatransfer$dnd$DragGestureEvent,
                            'DragSourceDragEvent': instance.uno_Type_com$sun$star$datatransfer$dnd$DragSourceDragEvent,
                            'DragSourceDropEvent': instance.uno_Type_com$sun$star$datatransfer$dnd$DragSourceDropEvent,
                            'DragSourceEvent': instance.uno_Type_com$sun$star$datatransfer$dnd$DragSourceEvent,
                            'DropTargetDragEnterEvent': instance.uno_Type_com$sun$star$datatransfer$dnd$DropTargetDragEnterEvent,
                            'DropTargetDragEvent': instance.uno_Type_com$sun$star$datatransfer$dnd$DropTargetDragEvent,
                            'DropTargetDropEvent': instance.uno_Type_com$sun$star$datatransfer$dnd$DropTargetDropEvent,
                            'DropTargetEvent': instance.uno_Type_com$sun$star$datatransfer$dnd$DropTargetEvent,
                            'InvalidDNDOperationException': instance.uno_Type_com$sun$star$datatransfer$dnd$InvalidDNDOperationException,
                            'XAutoscroll': instance.uno_Type_com$sun$star$datatransfer$dnd$XAutoscroll,
                            'XDragGestureListener': instance.uno_Type_com$sun$star$datatransfer$dnd$XDragGestureListener,
                            'XDragGestureRecognizer': instance.uno_Type_com$sun$star$datatransfer$dnd$XDragGestureRecognizer,
                            'XDragSource': instance.uno_Type_com$sun$star$datatransfer$dnd$XDragSource,
                            'XDragSourceContext': instance.uno_Type_com$sun$star$datatransfer$dnd$XDragSourceContext,
                            'XDragSourceListener': instance.uno_Type_com$sun$star$datatransfer$dnd$XDragSourceListener,
                            'XDropTarget': instance.uno_Type_com$sun$star$datatransfer$dnd$XDropTarget,
                            'XDropTargetDragContext': instance.uno_Type_com$sun$star$datatransfer$dnd$XDropTargetDragContext,
                            'XDropTargetDropContext': instance.uno_Type_com$sun$star$datatransfer$dnd$XDropTargetDropContext,
                            'XDropTargetListener': instance.uno_Type_com$sun$star$datatransfer$dnd$XDropTargetListener,
                            'DNDConstants': {
                                'ACTION_COPY': 1,
                                'ACTION_COPY_OR_MOVE': 3,
                                'ACTION_DEFAULT': -128,
                                'ACTION_LINK': 4,
                                'ACTION_MOVE': 2,
                                'ACTION_NONE': 0,
                                'ACTION_REFERENCE': 4
                            }
                        }
                    },
                    'deployment': {
                        'DependencyException': instance.uno_Type_com$sun$star$deployment$DependencyException,
                        'DeploymentException': instance.uno_Type_com$sun$star$deployment$DeploymentException,
                        'ExtensionManager': instance.uno_Function_com$sun$star$deployment$ExtensionManager,
                        'ExtensionRemovedException': instance.uno_Type_com$sun$star$deployment$ExtensionRemovedException,
                        'InstallException': instance.uno_Type_com$sun$star$deployment$InstallException,
                        'InvalidRemovedParameterException': instance.uno_Type_com$sun$star$deployment$InvalidRemovedParameterException,
                        'LicenseException': instance.uno_Type_com$sun$star$deployment$LicenseException,
                        'PackageInformationProvider': instance.uno_Function_com$sun$star$deployment$PackageInformationProvider,
                        'PlatformException': instance.uno_Type_com$sun$star$deployment$PlatformException,
                        'UpdateInformationEntry': instance.uno_Type_com$sun$star$deployment$UpdateInformationEntry,
                        'VersionException': instance.uno_Type_com$sun$star$deployment$VersionException,
                        'XExtensionManager': instance.uno_Type_com$sun$star$deployment$XExtensionManager,
                        'XPackage': instance.uno_Type_com$sun$star$deployment$XPackage,
                        'XPackageInformationProvider': instance.uno_Type_com$sun$star$deployment$XPackageInformationProvider,
                        'XPackageManager': instance.uno_Type_com$sun$star$deployment$XPackageManager,
                        'XPackageManagerFactory': instance.uno_Type_com$sun$star$deployment$XPackageManagerFactory,
                        'XPackageRegistry': instance.uno_Type_com$sun$star$deployment$XPackageRegistry,
                        'XPackageTypeInfo': instance.uno_Type_com$sun$star$deployment$XPackageTypeInfo,
                        'XUpdateInformationProvider': instance.uno_Type_com$sun$star$deployment$XUpdateInformationProvider,
                        'thePackageManagerFactory': instance.uno_Function_com$sun$star$deployment$thePackageManagerFactory,
                        'PackageRegistryBackend': {
                            'createTransient': instance.uno_Function_com$sun$star$deployment$PackageRegistryBackend$$createTransient,
                            'createPersistent': instance.uno_Function_com$sun$star$deployment$PackageRegistryBackend$$createPersistent
                        },
                        'Prerequisites': {
                            'DEPENDENCIES': 2,
                            'LICENSE': 4,
                            'PLATFORM': 1
                        },
                        'UpdateInformationProvider': {
                            'create': instance.uno_Function_com$sun$star$deployment$UpdateInformationProvider$$create
                        },
                        'test': {
                            'SmoketestCommandEnvironment': {
                                'create': instance.uno_Function_com$sun$star$deployment$test$SmoketestCommandEnvironment$$create
                            }
                        },
                        'ui': {
                            'LicenseDialog': {
                                'create': instance.uno_Function_com$sun$star$deployment$ui$LicenseDialog$$create
                            },
                            'PackageManagerDialog': {
                                'createDefault': instance.uno_Function_com$sun$star$deployment$ui$PackageManagerDialog$$createDefault,
                                'create': instance.uno_Function_com$sun$star$deployment$ui$PackageManagerDialog$$create,
                                'createAndInstall': instance.uno_Function_com$sun$star$deployment$ui$PackageManagerDialog$$createAndInstall
                            },
                            'UpdateRequiredDialog': {
                                'create': instance.uno_Function_com$sun$star$deployment$ui$UpdateRequiredDialog$$create
                            }
                        }
                    },
                    'document': {
                        'AmbigousFilterRequest': instance.uno_Type_com$sun$star$document$AmbigousFilterRequest,
                        'BrokenPackageRequest': instance.uno_Type_com$sun$star$document$BrokenPackageRequest,
                        'ChangedByOthersRequest': instance.uno_Type_com$sun$star$document$ChangedByOthersRequest,
                        'CmisProperty': instance.uno_Type_com$sun$star$document$CmisProperty,
                        'CmisVersion': instance.uno_Type_com$sun$star$document$CmisVersion,
                        'CorruptedFilterConfigurationException': instance.uno_Type_com$sun$star$document$CorruptedFilterConfigurationException,
                        'DocumentEvent': instance.uno_Type_com$sun$star$document$DocumentEvent,
                        'EmptyUndoStackException': instance.uno_Type_com$sun$star$document$EmptyUndoStackException,
                        'EventObject': instance.uno_Type_com$sun$star$document$EventObject,
                        'ExoticFileLoadException': instance.uno_Type_com$sun$star$document$ExoticFileLoadException,
                        'FilterOptionsRequest': instance.uno_Type_com$sun$star$document$FilterOptionsRequest,
                        'LockFileCorruptRequest': instance.uno_Type_com$sun$star$document$LockFileCorruptRequest,
                        'LockFileIgnoreRequest': instance.uno_Type_com$sun$star$document$LockFileIgnoreRequest,
                        'LockedDocumentRequest': instance.uno_Type_com$sun$star$document$LockedDocumentRequest,
                        'LockedOnSavingRequest': instance.uno_Type_com$sun$star$document$LockedOnSavingRequest,
                        'NoSuchFilterRequest': instance.uno_Type_com$sun$star$document$NoSuchFilterRequest,
                        'OwnLockOnDocumentRequest': instance.uno_Type_com$sun$star$document$OwnLockOnDocumentRequest,
                        'ReloadEditableRequest': instance.uno_Type_com$sun$star$document$ReloadEditableRequest,
                        'UndoContextNotClosedException': instance.uno_Type_com$sun$star$document$UndoContextNotClosedException,
                        'UndoFailedException': instance.uno_Type_com$sun$star$document$UndoFailedException,
                        'UndoManagerEvent': instance.uno_Type_com$sun$star$document$UndoManagerEvent,
                        'XActionLockable': instance.uno_Type_com$sun$star$document$XActionLockable,
                        'XBinaryStreamResolver': instance.uno_Type_com$sun$star$document$XBinaryStreamResolver,
                        'XCmisDocument': instance.uno_Type_com$sun$star$document$XCmisDocument,
                        'XCodeNameQuery': instance.uno_Type_com$sun$star$document$XCodeNameQuery,
                        'XCompatWriterDocProperties': instance.uno_Type_com$sun$star$document$XCompatWriterDocProperties,
                        'XDocumentEventBroadcaster': instance.uno_Type_com$sun$star$document$XDocumentEventBroadcaster,
                        'XDocumentEventListener': instance.uno_Type_com$sun$star$document$XDocumentEventListener,
                        'XDocumentInsertable': instance.uno_Type_com$sun$star$document$XDocumentInsertable,
                        'XDocumentLanguages': instance.uno_Type_com$sun$star$document$XDocumentLanguages,
                        'XDocumentProperties': instance.uno_Type_com$sun$star$document$XDocumentProperties,
                        'XDocumentProperties2': instance.uno_Type_com$sun$star$document$XDocumentProperties2,
                        'XDocumentPropertiesSupplier': instance.uno_Type_com$sun$star$document$XDocumentPropertiesSupplier,
                        'XDocumentRecovery': instance.uno_Type_com$sun$star$document$XDocumentRecovery,
                        'XDocumentRecovery2': instance.uno_Type_com$sun$star$document$XDocumentRecovery2,
                        'XDocumentRevisionListPersistence': instance.uno_Type_com$sun$star$document$XDocumentRevisionListPersistence,
                        'XDocumentSubStorageSupplier': instance.uno_Type_com$sun$star$document$XDocumentSubStorageSupplier,
                        'XEmbeddedObjectResolver': instance.uno_Type_com$sun$star$document$XEmbeddedObjectResolver,
                        'XEmbeddedObjectSupplier': instance.uno_Type_com$sun$star$document$XEmbeddedObjectSupplier,
                        'XEmbeddedObjectSupplier2': instance.uno_Type_com$sun$star$document$XEmbeddedObjectSupplier2,
                        'XEmbeddedScripts': instance.uno_Type_com$sun$star$document$XEmbeddedScripts,
                        'XEventBroadcaster': instance.uno_Type_com$sun$star$document$XEventBroadcaster,
                        'XEventListener': instance.uno_Type_com$sun$star$document$XEventListener,
                        'XEventsSupplier': instance.uno_Type_com$sun$star$document$XEventsSupplier,
                        'XExporter': instance.uno_Type_com$sun$star$document$XExporter,
                        'XExtendedFilterDetection': instance.uno_Type_com$sun$star$document$XExtendedFilterDetection,
                        'XFilter': instance.uno_Type_com$sun$star$document$XFilter,
                        'XFilterAdapter': instance.uno_Type_com$sun$star$document$XFilterAdapter,
                        'XGraphicObjectResolver': instance.uno_Type_com$sun$star$document$XGraphicObjectResolver,
                        'XGraphicStorageHandler': instance.uno_Type_com$sun$star$document$XGraphicStorageHandler,
                        'XImporter': instance.uno_Type_com$sun$star$document$XImporter,
                        'XInteractionFilterOptions': instance.uno_Type_com$sun$star$document$XInteractionFilterOptions,
                        'XInteractionFilterSelect': instance.uno_Type_com$sun$star$document$XInteractionFilterSelect,
                        'XLinkTargetSupplier': instance.uno_Type_com$sun$star$document$XLinkTargetSupplier,
                        'XMimeTypeInfo': instance.uno_Type_com$sun$star$document$XMimeTypeInfo,
                        'XOOXMLDocumentPropertiesImporter': instance.uno_Type_com$sun$star$document$XOOXMLDocumentPropertiesImporter,
                        'XRedlinesSupplier': instance.uno_Type_com$sun$star$document$XRedlinesSupplier,
                        'XScriptInvocationContext': instance.uno_Type_com$sun$star$document$XScriptInvocationContext,
                        'XShapeEventBroadcaster': instance.uno_Type_com$sun$star$document$XShapeEventBroadcaster,
                        'XShapeEventListener': instance.uno_Type_com$sun$star$document$XShapeEventListener,
                        'XStorageBasedDocument': instance.uno_Type_com$sun$star$document$XStorageBasedDocument,
                        'XStorageChangeListener': instance.uno_Type_com$sun$star$document$XStorageChangeListener,
                        'XTypeDetection': instance.uno_Type_com$sun$star$document$XTypeDetection,
                        'XUndoAction': instance.uno_Type_com$sun$star$document$XUndoAction,
                        'XUndoManager': instance.uno_Type_com$sun$star$document$XUndoManager,
                        'XUndoManagerListener': instance.uno_Type_com$sun$star$document$XUndoManagerListener,
                        'XUndoManagerSupplier': instance.uno_Type_com$sun$star$document$XUndoManagerSupplier,
                        'XVbaMethodParameter': instance.uno_Type_com$sun$star$document$XVbaMethodParameter,
                        'XViewDataSupplier': instance.uno_Type_com$sun$star$document$XViewDataSupplier,
                        'XXMLBasicExporter': instance.uno_Type_com$sun$star$document$XXMLBasicExporter,
                        'DocumentProperties': {
                            'create': instance.uno_Function_com$sun$star$document$DocumentProperties$$create
                        },
                        'DocumentRevisionListPersistence': {
                            'create': instance.uno_Function_com$sun$star$document$DocumentRevisionListPersistence$$create
                        },
                        'FilterConfigRefresh': {
                            'create': instance.uno_Function_com$sun$star$document$FilterConfigRefresh$$create
                        },
                        'GraphicStorageHandler': {
                            'createWithStorage': instance.uno_Function_com$sun$star$document$GraphicStorageHandler$$createWithStorage
                        },
                        'IndexedPropertyValues': {
                            'create': instance.uno_Function_com$sun$star$document$IndexedPropertyValues$$create
                        },
                        'LinkUpdateModes': {
                            'AUTO': 2,
                            'GLOBAL_SETTING': 3,
                            'MANUAL': 1,
                            'NEVER': 0
                        },
                        'MacroExecMode': {
                            'ALWAYS_EXECUTE': 2,
                            'ALWAYS_EXECUTE_NO_WARN': 4,
                            'FROM_LIST': 1,
                            'FROM_LIST_AND_SIGNED_NO_WARN': 9,
                            'FROM_LIST_AND_SIGNED_WARN': 8,
                            'FROM_LIST_NO_WARN': 7,
                            'NEVER_EXECUTE': 0,
                            'USE_CONFIG': 3,
                            'USE_CONFIG_APPROVE_CONFIRMATION': 6,
                            'USE_CONFIG_REJECT_CONFIRMATION': 5
                        },
                        'NamedPropertyValues': {
                            'create': instance.uno_Function_com$sun$star$document$NamedPropertyValues$$create
                        },
                        'OOXMLDocumentPropertiesImporter': {
                            'create': instance.uno_Function_com$sun$star$document$OOXMLDocumentPropertiesImporter$$create
                        },
                        'OleEmbeddedServerRegistration': {
                            'create': instance.uno_Function_com$sun$star$document$OleEmbeddedServerRegistration$$create
                        },
                        'PrinterIndependentLayout': {
                            'DISABLED': 1,
                            'ENABLED': 2,
                            'HIGH_RESOLUTION': 3,
                            'LOW_RESOLUTION': 2
                        },
                        'RedlineDisplayType': {
                            'INSERTED': 1,
                            'INSERTED_AND_REMOVED': 2,
                            'NONE': 0,
                            'REMOVED': 3
                        },
                        'UpdateDocMode': {
                            'ACCORDING_TO_CONFIG': 2,
                            'FULL_UPDATE': 3,
                            'NO_UPDATE': 0,
                            'QUIET_UPDATE': 1
                        },
                        'XMLBasicExporter': {
                            'createWithHandler': instance.uno_Function_com$sun$star$document$XMLBasicExporter$$createWithHandler
                        },
                        'XMLOasisBasicExporter': {
                            'createWithHandler': instance.uno_Function_com$sun$star$document$XMLOasisBasicExporter$$createWithHandler
                        }
                    },
                    'drawing': {
                        'Alignment': instance.uno_Type_com$sun$star$drawing$Alignment,
                        'Arrangement': instance.uno_Type_com$sun$star$drawing$Arrangement,
                        'BarCode': instance.uno_Type_com$sun$star$drawing$BarCode,
                        'BezierPoint': instance.uno_Type_com$sun$star$drawing$BezierPoint,
                        'BitmapMode': instance.uno_Type_com$sun$star$drawing$BitmapMode,
                        'BoundVolume': instance.uno_Type_com$sun$star$drawing$BoundVolume,
                        'CameraGeometry': instance.uno_Type_com$sun$star$drawing$CameraGeometry,
                        'CircleKind': instance.uno_Type_com$sun$star$drawing$CircleKind,
                        'ColorMode': instance.uno_Type_com$sun$star$drawing$ColorMode,
                        'ConnectionType': instance.uno_Type_com$sun$star$drawing$ConnectionType,
                        'ConnectorType': instance.uno_Type_com$sun$star$drawing$ConnectorType,
                        'DashStyle': instance.uno_Type_com$sun$star$drawing$DashStyle,
                        'Direction3D': instance.uno_Type_com$sun$star$drawing$Direction3D,
                        'DrawViewMode': instance.uno_Type_com$sun$star$drawing$DrawViewMode,
                        'EnhancedCustomShapeAdjustmentValue': instance.uno_Type_com$sun$star$drawing$EnhancedCustomShapeAdjustmentValue,
                        'EnhancedCustomShapeParameter': instance.uno_Type_com$sun$star$drawing$EnhancedCustomShapeParameter,
                        'EnhancedCustomShapeParameterPair': instance.uno_Type_com$sun$star$drawing$EnhancedCustomShapeParameterPair,
                        'EnhancedCustomShapeSegment': instance.uno_Type_com$sun$star$drawing$EnhancedCustomShapeSegment,
                        'EnhancedCustomShapeTextFrame': instance.uno_Type_com$sun$star$drawing$EnhancedCustomShapeTextFrame,
                        'EnhancedCustomShapeTextPathMode': instance.uno_Type_com$sun$star$drawing$EnhancedCustomShapeTextPathMode,
                        'EscapeDirection': instance.uno_Type_com$sun$star$drawing$EscapeDirection,
                        'FillStyle': instance.uno_Type_com$sun$star$drawing$FillStyle,
                        'GluePoint': instance.uno_Type_com$sun$star$drawing$GluePoint,
                        'GluePoint2': instance.uno_Type_com$sun$star$drawing$GluePoint2,
                        'GraphicFilterRequest': instance.uno_Type_com$sun$star$drawing$GraphicFilterRequest,
                        'Hatch': instance.uno_Type_com$sun$star$drawing$Hatch,
                        'HatchStyle': instance.uno_Type_com$sun$star$drawing$HatchStyle,
                        'HomogenMatrix': instance.uno_Type_com$sun$star$drawing$HomogenMatrix,
                        'HomogenMatrix3': instance.uno_Type_com$sun$star$drawing$HomogenMatrix3,
                        'HomogenMatrix4': instance.uno_Type_com$sun$star$drawing$HomogenMatrix4,
                        'HomogenMatrixLine': instance.uno_Type_com$sun$star$drawing$HomogenMatrixLine,
                        'HomogenMatrixLine3': instance.uno_Type_com$sun$star$drawing$HomogenMatrixLine3,
                        'HomogenMatrixLine4': instance.uno_Type_com$sun$star$drawing$HomogenMatrixLine4,
                        'HorizontalDimensioning': instance.uno_Type_com$sun$star$drawing$HorizontalDimensioning,
                        'LayerType': instance.uno_Type_com$sun$star$drawing$LayerType,
                        'LineCap': instance.uno_Type_com$sun$star$drawing$LineCap,
                        'LineDash': instance.uno_Type_com$sun$star$drawing$LineDash,
                        'LineEndType': instance.uno_Type_com$sun$star$drawing$LineEndType,
                        'LineJoint': instance.uno_Type_com$sun$star$drawing$LineJoint,
                        'LineStyle': instance.uno_Type_com$sun$star$drawing$LineStyle,
                        'MeasureKind': instance.uno_Type_com$sun$star$drawing$MeasureKind,
                        'MeasureTextHorzPos': instance.uno_Type_com$sun$star$drawing$MeasureTextHorzPos,
                        'MeasureTextVertPos': instance.uno_Type_com$sun$star$drawing$MeasureTextVertPos,
                        'MirrorAxis': instance.uno_Type_com$sun$star$drawing$MirrorAxis,
                        'NormalsKind': instance.uno_Type_com$sun$star$drawing$NormalsKind,
                        'PolyPolygonBezierCoords': instance.uno_Type_com$sun$star$drawing$PolyPolygonBezierCoords,
                        'PolyPolygonShape3D': instance.uno_Type_com$sun$star$drawing$PolyPolygonShape3D,
                        'PolygonFlags': instance.uno_Type_com$sun$star$drawing$PolygonFlags,
                        'PolygonKind': instance.uno_Type_com$sun$star$drawing$PolygonKind,
                        'Position3D': instance.uno_Type_com$sun$star$drawing$Position3D,
                        'ProjectionMode': instance.uno_Type_com$sun$star$drawing$ProjectionMode,
                        'RectanglePoint': instance.uno_Type_com$sun$star$drawing$RectanglePoint,
                        'ShadeMode': instance.uno_Type_com$sun$star$drawing$ShadeMode,
                        'SnapObjectType': instance.uno_Type_com$sun$star$drawing$SnapObjectType,
                        'TextAdjust': instance.uno_Type_com$sun$star$drawing$TextAdjust,
                        'TextAnimationDirection': instance.uno_Type_com$sun$star$drawing$TextAnimationDirection,
                        'TextAnimationKind': instance.uno_Type_com$sun$star$drawing$TextAnimationKind,
                        'TextFitToSizeType': instance.uno_Type_com$sun$star$drawing$TextFitToSizeType,
                        'TextHorizontalAdjust': instance.uno_Type_com$sun$star$drawing$TextHorizontalAdjust,
                        'TextVerticalAdjust': instance.uno_Type_com$sun$star$drawing$TextVerticalAdjust,
                        'TextureKind': instance.uno_Type_com$sun$star$drawing$TextureKind,
                        'TextureKind2': instance.uno_Type_com$sun$star$drawing$TextureKind2,
                        'TextureMode': instance.uno_Type_com$sun$star$drawing$TextureMode,
                        'TextureProjectionMode': instance.uno_Type_com$sun$star$drawing$TextureProjectionMode,
                        'VerticalDimensioning': instance.uno_Type_com$sun$star$drawing$VerticalDimensioning,
                        'XConnectableShape': instance.uno_Type_com$sun$star$drawing$XConnectableShape,
                        'XConnectorShape': instance.uno_Type_com$sun$star$drawing$XConnectorShape,
                        'XControlShape': instance.uno_Type_com$sun$star$drawing$XControlShape,
                        'XCustomShapeEngine': instance.uno_Type_com$sun$star$drawing$XCustomShapeEngine,
                        'XCustomShapeHandle': instance.uno_Type_com$sun$star$drawing$XCustomShapeHandle,
                        'XDrawPage': instance.uno_Type_com$sun$star$drawing$XDrawPage,
                        'XDrawPageDuplicator': instance.uno_Type_com$sun$star$drawing$XDrawPageDuplicator,
                        'XDrawPageExpander': instance.uno_Type_com$sun$star$drawing$XDrawPageExpander,
                        'XDrawPageSummarizer': instance.uno_Type_com$sun$star$drawing$XDrawPageSummarizer,
                        'XDrawPageSupplier': instance.uno_Type_com$sun$star$drawing$XDrawPageSupplier,
                        'XDrawPages': instance.uno_Type_com$sun$star$drawing$XDrawPages,
                        'XDrawPagesSupplier': instance.uno_Type_com$sun$star$drawing$XDrawPagesSupplier,
                        'XDrawSubController': instance.uno_Type_com$sun$star$drawing$XDrawSubController,
                        'XDrawView': instance.uno_Type_com$sun$star$drawing$XDrawView,
                        'XEnhancedCustomShapeDefaulter': instance.uno_Type_com$sun$star$drawing$XEnhancedCustomShapeDefaulter,
                        'XGluePointsSupplier': instance.uno_Type_com$sun$star$drawing$XGluePointsSupplier,
                        'XGraphicExportFilter': instance.uno_Type_com$sun$star$drawing$XGraphicExportFilter,
                        'XLayer': instance.uno_Type_com$sun$star$drawing$XLayer,
                        'XLayerManager': instance.uno_Type_com$sun$star$drawing$XLayerManager,
                        'XLayerSupplier': instance.uno_Type_com$sun$star$drawing$XLayerSupplier,
                        'XMasterPageTarget': instance.uno_Type_com$sun$star$drawing$XMasterPageTarget,
                        'XMasterPagesSupplier': instance.uno_Type_com$sun$star$drawing$XMasterPagesSupplier,
                        'XPresenterHelper': instance.uno_Type_com$sun$star$drawing$XPresenterHelper,
                        'XSelectionFunction': instance.uno_Type_com$sun$star$drawing$XSelectionFunction,
                        'XShape': instance.uno_Type_com$sun$star$drawing$XShape,
                        'XShapeAligner': instance.uno_Type_com$sun$star$drawing$XShapeAligner,
                        'XShapeArranger': instance.uno_Type_com$sun$star$drawing$XShapeArranger,
                        'XShapeBinder': instance.uno_Type_com$sun$star$drawing$XShapeBinder,
                        'XShapeCombiner': instance.uno_Type_com$sun$star$drawing$XShapeCombiner,
                        'XShapeDescriptor': instance.uno_Type_com$sun$star$drawing$XShapeDescriptor,
                        'XShapeGroup': instance.uno_Type_com$sun$star$drawing$XShapeGroup,
                        'XShapeGrouper': instance.uno_Type_com$sun$star$drawing$XShapeGrouper,
                        'XShapeMirror': instance.uno_Type_com$sun$star$drawing$XShapeMirror,
                        'XShapes': instance.uno_Type_com$sun$star$drawing$XShapes,
                        'XShapes2': instance.uno_Type_com$sun$star$drawing$XShapes2,
                        'XShapes3': instance.uno_Type_com$sun$star$drawing$XShapes3,
                        'XSlidePreviewCache': instance.uno_Type_com$sun$star$drawing$XSlidePreviewCache,
                        'XSlidePreviewCacheListener': instance.uno_Type_com$sun$star$drawing$XSlidePreviewCacheListener,
                        'XSlideRenderer': instance.uno_Type_com$sun$star$drawing$XSlideRenderer,
                        'XSlideSorterBase': instance.uno_Type_com$sun$star$drawing$XSlideSorterBase,
                        'XUniversalShapeDescriptor': instance.uno_Type_com$sun$star$drawing$XUniversalShapeDescriptor,
                        'BarCodeErrorCorrection': {
                            'HIGH': 4,
                            'LOW': 1,
                            'MEDIUM': 2,
                            'QUARTILE': 3
                        },
                        'CanvasFeature': {
                            'None': 0,
                            'SpriteCanvas': 1
                        },
                        'CaptionEscapeDirection': {
                            'auto': 2,
                            'horizontal': 0,
                            'vertical': 1
                        },
                        'CaptionType': {
                            'angled': 1,
                            'connector': 2,
                            'straight': 0
                        },
                        'ColorTable': {
                            'create': instance.uno_Function_com$sun$star$drawing$ColorTable$$create
                        },
                        'EnhancedCustomShapeGluePointType': {
                            'CUSTOM': 2,
                            'NONE': 0,
                            'RECT': 3,
                            'SEGMENTS': 1
                        },
                        'EnhancedCustomShapeMetalType': {
                            'MetalMSCompatible': 1,
                            'MetalODF': 0
                        },
                        'EnhancedCustomShapeParameterType': {
                            'ADJUSTMENT': 2,
                            'BOTTOM': 6,
                            'EQUATION': 1,
                            'HASFILL': 10,
                            'HASSTROKE': 9,
                            'HEIGHT': 12,
                            'LEFT': 3,
                            'LOGHEIGHT': 14,
                            'LOGWIDTH': 13,
                            'NORMAL': 0,
                            'RIGHT': 5,
                            'TOP': 4,
                            'WIDTH': 11,
                            'XSTRETCH': 7,
                            'YSTRETCH': 8
                        },
                        'EnhancedCustomShapeSegmentCommand': {
                            'ANGLEELLIPSE': 9,
                            'ANGLEELLIPSETO': 8,
                            'ARC': 11,
                            'ARCANGLETO': 17,
                            'ARCTO': 10,
                            'CLOCKWISEARC': 13,
                            'CLOCKWISEARCTO': 12,
                            'CLOSESUBPATH': 4,
                            'CURVETO': 3,
                            'DARKEN': 18,
                            'DARKENLESS': 19,
                            'ELLIPTICALQUADRANTX': 14,
                            'ELLIPTICALQUADRANTY': 15,
                            'ENDSUBPATH': 5,
                            'LIGHTEN': 20,
                            'LIGHTENLESS': 21,
                            'LINETO': 2,
                            'MOVETO': 1,
                            'NOFILL': 6,
                            'NOSTROKE': 7,
                            'QUADRATICCURVETO': 16,
                            'UNKNOWN': 0
                        },
                        'GraphicExportFilter': {
                            'create': instance.uno_Function_com$sun$star$drawing$GraphicExportFilter$$create
                        },
                        'ModuleDispatcher': {
                            'create': instance.uno_Function_com$sun$star$drawing$ModuleDispatcher$$create
                        },
                        'ShadingPattern': {
                            'CLEAR': 0,
                            'DIAG_CROSS': 19,
                            'DIAG_STRIPE': 17,
                            'HORZ_CROSS': 18,
                            'HORZ_STRIPE': 14,
                            'NIL': 65535,
                            'PCT10': 3,
                            'PCT12': 37,
                            'PCT15': 38,
                            'PCT17': 39,
                            'PCT2': 35,
                            'PCT20': 4,
                            'PCT22': 40,
                            'PCT25': 5,
                            'PCT27': 41,
                            'PCT30': 6,
                            'PCT32': 42,
                            'PCT35': 43,
                            'PCT37': 44,
                            'PCT40': 7,
                            'PCT42': 45,
                            'PCT45': 46,
                            'PCT47': 47,
                            'PCT5': 2,
                            'PCT50': 8,
                            'PCT52': 48,
                            'PCT55': 49,
                            'PCT57': 50,
                            'PCT60': 9,
                            'PCT62': 51,
                            'PCT65': 52,
                            'PCT67': 53,
                            'PCT7': 36,
                            'PCT70': 10,
                            'PCT72': 54,
                            'PCT75': 11,
                            'PCT77': 55,
                            'PCT80': 12,
                            'PCT82': 56,
                            'PCT85': 57,
                            'PCT87': 58,
                            'PCT90': 13,
                            'PCT92': 59,
                            'PCT95': 60,
                            'PCT97': 61,
                            'REVERSE_DIAG_STRIPE': 16,
                            'SOLID': 1,
                            'THIN_DIAG_CROSS': 25,
                            'THIN_DIAG_STRIPE': 23,
                            'THIN_HORZ_CROSS': 24,
                            'THIN_HORZ_STRIPE': 20,
                            'THIN_REVERSE_DIAG_STRIPE': 22,
                            'THIN_VERT_STRIPE': 21,
                            'UNUSED_1': 26,
                            'UNUSED_2': 27,
                            'UNUSED_3': 28,
                            'UNUSED_4': 29,
                            'UNUSED_5': 30,
                            'UNUSED_6': 31,
                            'UNUSED_7': 32,
                            'UNUSED_8': 33,
                            'UNUSED_9': 34,
                            'VERT_STRIPE': 15
                        },
                        'ShapeCollection': {
                            'create': instance.uno_Function_com$sun$star$drawing$ShapeCollection$$create
                        },
                        'SlideRenderer': {
                            'create': instance.uno_Function_com$sun$star$drawing$SlideRenderer$$create
                        },
                        'SlideSorter': {
                            'create': instance.uno_Function_com$sun$star$drawing$SlideSorter$$create
                        },
                        'framework': {
                            'AnchorBindingMode': instance.uno_Type_com$sun$star$drawing$framework$AnchorBindingMode,
                            'BorderType': instance.uno_Type_com$sun$star$drawing$framework$BorderType,
                            'ConfigurationChangeEvent': instance.uno_Type_com$sun$star$drawing$framework$ConfigurationChangeEvent,
                            'ResourceActivationMode': instance.uno_Type_com$sun$star$drawing$framework$ResourceActivationMode,
                            'TabBarButton': instance.uno_Type_com$sun$star$drawing$framework$TabBarButton,
                            'XConfiguration': instance.uno_Type_com$sun$star$drawing$framework$XConfiguration,
                            'XConfigurationChangeListener': instance.uno_Type_com$sun$star$drawing$framework$XConfigurationChangeListener,
                            'XConfigurationChangeRequest': instance.uno_Type_com$sun$star$drawing$framework$XConfigurationChangeRequest,
                            'XConfigurationController': instance.uno_Type_com$sun$star$drawing$framework$XConfigurationController,
                            'XConfigurationControllerBroadcaster': instance.uno_Type_com$sun$star$drawing$framework$XConfigurationControllerBroadcaster,
                            'XConfigurationControllerRequestQueue': instance.uno_Type_com$sun$star$drawing$framework$XConfigurationControllerRequestQueue,
                            'XControllerManager': instance.uno_Type_com$sun$star$drawing$framework$XControllerManager,
                            'XModuleController': instance.uno_Type_com$sun$star$drawing$framework$XModuleController,
                            'XPane': instance.uno_Type_com$sun$star$drawing$framework$XPane,
                            'XPane2': instance.uno_Type_com$sun$star$drawing$framework$XPane2,
                            'XPaneBorderPainter': instance.uno_Type_com$sun$star$drawing$framework$XPaneBorderPainter,
                            'XRelocatableResource': instance.uno_Type_com$sun$star$drawing$framework$XRelocatableResource,
                            'XResource': instance.uno_Type_com$sun$star$drawing$framework$XResource,
                            'XResourceFactory': instance.uno_Type_com$sun$star$drawing$framework$XResourceFactory,
                            'XResourceFactoryManager': instance.uno_Type_com$sun$star$drawing$framework$XResourceFactoryManager,
                            'XResourceId': instance.uno_Type_com$sun$star$drawing$framework$XResourceId,
                            'XTabBar': instance.uno_Type_com$sun$star$drawing$framework$XTabBar,
                            'XToolBar': instance.uno_Type_com$sun$star$drawing$framework$XToolBar,
                            'XView': instance.uno_Type_com$sun$star$drawing$framework$XView,
                            'BasicPaneFactory': {
                                'create': instance.uno_Function_com$sun$star$drawing$framework$BasicPaneFactory$$create
                            },
                            'BasicToolBarFactory': {
                                'create': instance.uno_Function_com$sun$star$drawing$framework$BasicToolBarFactory$$create
                            },
                            'BasicViewFactory': {
                                'create': instance.uno_Function_com$sun$star$drawing$framework$BasicViewFactory$$create
                            },
                            'ResourceId': {
                                'createEmpty': instance.uno_Function_com$sun$star$drawing$framework$ResourceId$$createEmpty,
                                'create': instance.uno_Function_com$sun$star$drawing$framework$ResourceId$$create,
                                'createWithAnchor': instance.uno_Function_com$sun$star$drawing$framework$ResourceId$$createWithAnchor,
                                'createWithAnchorURL': instance.uno_Function_com$sun$star$drawing$framework$ResourceId$$createWithAnchorURL
                            }
                        }
                    },
                    'embed': {
                        'InsertedObjectInfo': instance.uno_Type_com$sun$star$embed$InsertedObjectInfo,
                        'InvalidStorageException': instance.uno_Type_com$sun$star$embed$InvalidStorageException,
                        'LinkageMisuseException': instance.uno_Type_com$sun$star$embed$LinkageMisuseException,
                        'NeedsRunningStateException': instance.uno_Type_com$sun$star$embed$NeedsRunningStateException,
                        'NoVisualAreaSizeException': instance.uno_Type_com$sun$star$embed$NoVisualAreaSizeException,
                        'ObjectSaveVetoException': instance.uno_Type_com$sun$star$embed$ObjectSaveVetoException,
                        'StateChangeInProgressException': instance.uno_Type_com$sun$star$embed$StateChangeInProgressException,
                        'StorageWrappedTargetException': instance.uno_Type_com$sun$star$embed$StorageWrappedTargetException,
                        'UnreachableStateException': instance.uno_Type_com$sun$star$embed$UnreachableStateException,
                        'UseBackupException': instance.uno_Type_com$sun$star$embed$UseBackupException,
                        'VerbDescriptor': instance.uno_Type_com$sun$star$embed$VerbDescriptor,
                        'VisualRepresentation': instance.uno_Type_com$sun$star$embed$VisualRepresentation,
                        'WrongStateException': instance.uno_Type_com$sun$star$embed$WrongStateException,
                        'XActionsApproval': instance.uno_Type_com$sun$star$embed$XActionsApproval,
                        'XClassifiedObject': instance.uno_Type_com$sun$star$embed$XClassifiedObject,
                        'XCommonEmbedPersist': instance.uno_Type_com$sun$star$embed$XCommonEmbedPersist,
                        'XComponentSupplier': instance.uno_Type_com$sun$star$embed$XComponentSupplier,
                        'XEmbedObjectClipboardCreator': instance.uno_Type_com$sun$star$embed$XEmbedObjectClipboardCreator,
                        'XEmbedObjectCreator': instance.uno_Type_com$sun$star$embed$XEmbedObjectCreator,
                        'XEmbedObjectFactory': instance.uno_Type_com$sun$star$embed$XEmbedObjectFactory,
                        'XEmbedPersist': instance.uno_Type_com$sun$star$embed$XEmbedPersist,
                        'XEmbedPersist2': instance.uno_Type_com$sun$star$embed$XEmbedPersist2,
                        'XEmbeddedClient': instance.uno_Type_com$sun$star$embed$XEmbeddedClient,
                        'XEmbeddedObject': instance.uno_Type_com$sun$star$embed$XEmbeddedObject,
                        'XEmbeddedObjectCreator': instance.uno_Type_com$sun$star$embed$XEmbeddedObjectCreator,
                        'XEmbeddedOleObject': instance.uno_Type_com$sun$star$embed$XEmbeddedOleObject,
                        'XEncryptionProtectedSource': instance.uno_Type_com$sun$star$embed$XEncryptionProtectedSource,
                        'XEncryptionProtectedSource2': instance.uno_Type_com$sun$star$embed$XEncryptionProtectedSource2,
                        'XEncryptionProtectedStorage': instance.uno_Type_com$sun$star$embed$XEncryptionProtectedStorage,
                        'XExtendedStorageStream': instance.uno_Type_com$sun$star$embed$XExtendedStorageStream,
                        'XHatchWindow': instance.uno_Type_com$sun$star$embed$XHatchWindow,
                        'XHatchWindowController': instance.uno_Type_com$sun$star$embed$XHatchWindowController,
                        'XHatchWindowFactory': instance.uno_Type_com$sun$star$embed$XHatchWindowFactory,
                        'XHierarchicalStorageAccess': instance.uno_Type_com$sun$star$embed$XHierarchicalStorageAccess,
                        'XHierarchicalStorageAccess2': instance.uno_Type_com$sun$star$embed$XHierarchicalStorageAccess2,
                        'XInplaceClient': instance.uno_Type_com$sun$star$embed$XInplaceClient,
                        'XInplaceObject': instance.uno_Type_com$sun$star$embed$XInplaceObject,
                        'XInsertObjectDialog': instance.uno_Type_com$sun$star$embed$XInsertObjectDialog,
                        'XLinkCreator': instance.uno_Type_com$sun$star$embed$XLinkCreator,
                        'XLinkFactory': instance.uno_Type_com$sun$star$embed$XLinkFactory,
                        'XLinkageSupport': instance.uno_Type_com$sun$star$embed$XLinkageSupport,
                        'XOLESimpleStorage': instance.uno_Type_com$sun$star$embed$XOLESimpleStorage,
                        'XOptimizedStorage': instance.uno_Type_com$sun$star$embed$XOptimizedStorage,
                        'XPackageStructureCreator': instance.uno_Type_com$sun$star$embed$XPackageStructureCreator,
                        'XPersistanceHolder': instance.uno_Type_com$sun$star$embed$XPersistanceHolder,
                        'XRelationshipAccess': instance.uno_Type_com$sun$star$embed$XRelationshipAccess,
                        'XStateChangeBroadcaster': instance.uno_Type_com$sun$star$embed$XStateChangeBroadcaster,
                        'XStateChangeListener': instance.uno_Type_com$sun$star$embed$XStateChangeListener,
                        'XStorage': instance.uno_Type_com$sun$star$embed$XStorage,
                        'XStorage2': instance.uno_Type_com$sun$star$embed$XStorage2,
                        'XStorageRawAccess': instance.uno_Type_com$sun$star$embed$XStorageRawAccess,
                        'XTransactedObject': instance.uno_Type_com$sun$star$embed$XTransactedObject,
                        'XTransactionBroadcaster': instance.uno_Type_com$sun$star$embed$XTransactionBroadcaster,
                        'XTransactionListener': instance.uno_Type_com$sun$star$embed$XTransactionListener,
                        'XTransferableSupplier': instance.uno_Type_com$sun$star$embed$XTransferableSupplier,
                        'XVisualObject': instance.uno_Type_com$sun$star$embed$XVisualObject,
                        'XWindowSupplier': instance.uno_Type_com$sun$star$embed$XWindowSupplier,
                        'Actions': {
                            'PREVENT_CLOSE': 1,
                            'PREVENT_TERMINATION': 2
                        },
                        'Aspects': {
                            'MSOLE_CONTENT': 1n,
                            'MSOLE_DOCPRINT': 8n,
                            'MSOLE_ICON': 4n,
                            'MSOLE_THUMBNAIL': 2n
                        },
                        'DocumentCloser': {
                            'DocumentCloserCtor1': instance.uno_Function_com$sun$star$embed$DocumentCloser$$DocumentCloserCtor1
                        },
                        'ElementModes': {
                            'NOCREATE': 16,
                            'READ': 1,
                            'READWRITE': 7,
                            'SEEKABLE': 2,
                            'SEEKABLEREAD': 3,
                            'TRUNCATE': 8,
                            'WRITE': 4
                        },
                        'EmbedMapUnits': {
                            'ONE_1000TH_INCH': 4,
                            'ONE_100TH_INCH': 5,
                            'ONE_100TH_MM': 0,
                            'ONE_10TH_INCH': 6,
                            'ONE_10TH_MM': 1,
                            'ONE_CM': 3,
                            'ONE_INCH': 7,
                            'ONE_MM': 2,
                            'PIXEL': 10,
                            'POINT': 8,
                            'TWIP': 9
                        },
                        'EmbedMisc': {
                            'EMBED_ACTIVATEIMMEDIATELY': 4294967296n,
                            'EMBED_NEEDSSIZEONLOAD': 17179869184n,
                            'EMBED_NEVERRESIZE': 8589934592n,
                            'MS_EMBED_ACTIVATEWHENVISIBLE': 256n,
                            'MS_EMBED_ACTSLIKEBUTTON': 4096n,
                            'MS_EMBED_ACTSLIKELABEL': 8192n,
                            'MS_EMBED_ALIGNABLE': 32768n,
                            'MS_EMBED_ALWAYSRUN': 2048n,
                            'MS_EMBED_CANLINKBYOLE1': 32n,
                            'MS_EMBED_CANTLINKINSIDE': 16n,
                            'MS_EMBED_IGNOREACTIVATEWHENVISIBLE': 524288n,
                            'MS_EMBED_IMEMODE': 262144n,
                            'MS_EMBED_INSERTNOTREPLACE': 4n,
                            'MS_EMBED_INSIDEOUT': 128n,
                            'MS_EMBED_INVISIBLEATRUNTIME': 1024n,
                            'MS_EMBED_ISLINKOBJECT': 64n,
                            'MS_EMBED_NOUIACTIVATE': 16384n,
                            'MS_EMBED_ONLYICONIC': 2n,
                            'MS_EMBED_RECOMPOSEONRESIZE': 1n,
                            'MS_EMBED_RENDERINGISDEVICEINDEPENDENT': 512n,
                            'MS_EMBED_SETCLIENTSITEFIRST': 131072n,
                            'MS_EMBED_SIMPLEFRAME': 65536n,
                            'MS_EMBED_STATIC': 8n,
                            'MS_EMBED_SUPPORTSMULTILEVELUNDO': 2097152n,
                            'MS_EMBED_WANTSTOMENUMERGE': 1048576n
                        },
                        'EmbedStates': {
                            'ACTIVE': 2,
                            'INPLACE_ACTIVE': 3,
                            'LOADED': 0,
                            'RUNNING': 1,
                            'UI_ACTIVE': 4
                        },
                        'EmbedUpdateModes': {
                            'ALWAYS_UPDATE': 0,
                            'EXPLICIT_UPDATE': 1
                        },
                        'EmbedVerbs': {
                            'MS_OLEVERB_DISCARDUNDOSTATE': -6,
                            'MS_OLEVERB_HIDE': -3,
                            'MS_OLEVERB_IPACTIVATE': -5,
                            'MS_OLEVERB_OPEN': -2,
                            'MS_OLEVERB_PRIMARY': 0,
                            'MS_OLEVERB_SHOW': -1,
                            'MS_OLEVERB_UIACTIVATE': -4
                        },
                        'EmbeddedObjectCreator': {
                            'create': instance.uno_Function_com$sun$star$embed$EmbeddedObjectCreator$$create
                        },
                        'EntryInitModes': {
                            'DEFAULT_INIT': 0,
                            'MEDIA_DESCRIPTOR_INIT': 3,
                            'NO_INIT': 2,
                            'TRUNCATE_INIT': 1,
                            'URL_LINK_INIT': 4
                        },
                        'FileSystemStorageFactory': {
                            'create': instance.uno_Function_com$sun$star$embed$FileSystemStorageFactory$$create
                        },
                        'HatchWindowFactory': {
                            'create': instance.uno_Function_com$sun$star$embed$HatchWindowFactory$$create
                        },
                        'InstanceLocker': {
                            'InstanceLockerCtor1': instance.uno_Function_com$sun$star$embed$InstanceLocker$$InstanceLockerCtor1,
                            'InstanceLockerCtor2': instance.uno_Function_com$sun$star$embed$InstanceLocker$$InstanceLockerCtor2
                        },
                        'MSOLEObjectSystemCreator': {
                            'create': instance.uno_Function_com$sun$star$embed$MSOLEObjectSystemCreator$$create
                        },
                        'OLEEmbeddedObjectFactory': {
                            'create': instance.uno_Function_com$sun$star$embed$OLEEmbeddedObjectFactory$$create
                        },
                        'OLESimpleStorage': {
                            'createFromInputStream': instance.uno_Function_com$sun$star$embed$OLESimpleStorage$$createFromInputStream,
                            'createFromStream': instance.uno_Function_com$sun$star$embed$OLESimpleStorage$$createFromStream
                        },
                        'OOoEmbeddedObjectFactory': {
                            'create': instance.uno_Function_com$sun$star$embed$OOoEmbeddedObjectFactory$$create
                        },
                        'StorageFactory': {
                            'create': instance.uno_Function_com$sun$star$embed$StorageFactory$$create
                        },
                        'StorageFormats': {
                            'OFOPXML': 3,
                            'PACKAGE': 1,
                            'ZIP': 2
                        },
                        'VerbAttributes': {
                            'MS_VERBATTR_NEVERDIRTIES': 1,
                            'MS_VERBATTR_ONCONTAINERMENU': 2
                        }
                    },
                    'form': {
                        'DataSelectionType': instance.uno_Type_com$sun$star$form$DataSelectionType,
                        'DatabaseDeleteEvent': instance.uno_Type_com$sun$star$form$DatabaseDeleteEvent,
                        'DatabaseParameterEvent': instance.uno_Type_com$sun$star$form$DatabaseParameterEvent,
                        'ErrorEvent': instance.uno_Type_com$sun$star$form$ErrorEvent,
                        'FormButtonType': instance.uno_Type_com$sun$star$form$FormButtonType,
                        'FormSubmitEncoding': instance.uno_Type_com$sun$star$form$FormSubmitEncoding,
                        'FormSubmitMethod': instance.uno_Type_com$sun$star$form$FormSubmitMethod,
                        'ListSourceType': instance.uno_Type_com$sun$star$form$ListSourceType,
                        'NavigationBarMode': instance.uno_Type_com$sun$star$form$NavigationBarMode,
                        'TabulatorCycle': instance.uno_Type_com$sun$star$form$TabulatorCycle,
                        'XApproveActionBroadcaster': instance.uno_Type_com$sun$star$form$XApproveActionBroadcaster,
                        'XApproveActionListener': instance.uno_Type_com$sun$star$form$XApproveActionListener,
                        'XBoundComponent': instance.uno_Type_com$sun$star$form$XBoundComponent,
                        'XBoundControl': instance.uno_Type_com$sun$star$form$XBoundControl,
                        'XChangeBroadcaster': instance.uno_Type_com$sun$star$form$XChangeBroadcaster,
                        'XChangeListener': instance.uno_Type_com$sun$star$form$XChangeListener,
                        'XConfirmDeleteBroadcaster': instance.uno_Type_com$sun$star$form$XConfirmDeleteBroadcaster,
                        'XConfirmDeleteListener': instance.uno_Type_com$sun$star$form$XConfirmDeleteListener,
                        'XDatabaseParameterBroadcaster': instance.uno_Type_com$sun$star$form$XDatabaseParameterBroadcaster,
                        'XDatabaseParameterBroadcaster2': instance.uno_Type_com$sun$star$form$XDatabaseParameterBroadcaster2,
                        'XDatabaseParameterListener': instance.uno_Type_com$sun$star$form$XDatabaseParameterListener,
                        'XDeleteListener': instance.uno_Type_com$sun$star$form$XDeleteListener,
                        'XErrorBroadcaster': instance.uno_Type_com$sun$star$form$XErrorBroadcaster,
                        'XErrorListener': instance.uno_Type_com$sun$star$form$XErrorListener,
                        'XForm': instance.uno_Type_com$sun$star$form$XForm,
                        'XFormComponent': instance.uno_Type_com$sun$star$form$XFormComponent,
                        'XFormController': instance.uno_Type_com$sun$star$form$XFormController,
                        'XFormControllerListener': instance.uno_Type_com$sun$star$form$XFormControllerListener,
                        'XForms': instance.uno_Type_com$sun$star$form$XForms,
                        'XFormsSupplier': instance.uno_Type_com$sun$star$form$XFormsSupplier,
                        'XFormsSupplier2': instance.uno_Type_com$sun$star$form$XFormsSupplier2,
                        'XGrid': instance.uno_Type_com$sun$star$form$XGrid,
                        'XGridColumnFactory': instance.uno_Type_com$sun$star$form$XGridColumnFactory,
                        'XGridControl': instance.uno_Type_com$sun$star$form$XGridControl,
                        'XGridControlListener': instance.uno_Type_com$sun$star$form$XGridControlListener,
                        'XGridFieldDataSupplier': instance.uno_Type_com$sun$star$form$XGridFieldDataSupplier,
                        'XGridPeer': instance.uno_Type_com$sun$star$form$XGridPeer,
                        'XImageProducerSupplier': instance.uno_Type_com$sun$star$form$XImageProducerSupplier,
                        'XInsertListener': instance.uno_Type_com$sun$star$form$XInsertListener,
                        'XLoadListener': instance.uno_Type_com$sun$star$form$XLoadListener,
                        'XLoadable': instance.uno_Type_com$sun$star$form$XLoadable,
                        'XPositioningListener': instance.uno_Type_com$sun$star$form$XPositioningListener,
                        'XReset': instance.uno_Type_com$sun$star$form$XReset,
                        'XResetListener': instance.uno_Type_com$sun$star$form$XResetListener,
                        'XRestoreListener': instance.uno_Type_com$sun$star$form$XRestoreListener,
                        'XSubmit': instance.uno_Type_com$sun$star$form$XSubmit,
                        'XSubmitListener': instance.uno_Type_com$sun$star$form$XSubmitListener,
                        'XUpdateBroadcaster': instance.uno_Type_com$sun$star$form$XUpdateBroadcaster,
                        'XUpdateListener': instance.uno_Type_com$sun$star$form$XUpdateListener,
                        'ControlFontDialog': {
                            'createWithGridModel': instance.uno_Function_com$sun$star$form$ControlFontDialog$$createWithGridModel
                        },
                        'FormComponentType': {
                            'CHECKBOX': 5,
                            'COMBOBOX': 7,
                            'COMMANDBUTTON': 2,
                            'CONTROL': 1,
                            'CURRENCYFIELD': 18,
                            'DATEFIELD': 15,
                            'FILECONTROL': 12,
                            'FIXEDTEXT': 10,
                            'GRIDCONTROL': 11,
                            'GROUPBOX': 8,
                            'HIDDENCONTROL': 13,
                            'IMAGEBUTTON': 4,
                            'IMAGECONTROL': 14,
                            'LISTBOX': 6,
                            'NAVIGATIONBAR': 22,
                            'NUMERICFIELD': 17,
                            'PATTERNFIELD': 19,
                            'RADIOBUTTON': 3,
                            'SCROLLBAR': 20,
                            'SPINBUTTON': 21,
                            'TEXTFIELD': 9,
                            'TIMEFIELD': 16
                        },
                        'Forms': {
                            'create': instance.uno_Function_com$sun$star$form$Forms$$create
                        },
                        'TabOrderDialog': {
                            'createWithModel': instance.uno_Function_com$sun$star$form$TabOrderDialog$$createWithModel
                        },
                        'binding': {
                            'IncompatibleTypesException': instance.uno_Type_com$sun$star$form$binding$IncompatibleTypesException,
                            'InvalidBindingStateException': instance.uno_Type_com$sun$star$form$binding$InvalidBindingStateException,
                            'ListEntryEvent': instance.uno_Type_com$sun$star$form$binding$ListEntryEvent,
                            'XBindableValue': instance.uno_Type_com$sun$star$form$binding$XBindableValue,
                            'XListEntryListener': instance.uno_Type_com$sun$star$form$binding$XListEntryListener,
                            'XListEntrySink': instance.uno_Type_com$sun$star$form$binding$XListEntrySink,
                            'XListEntrySource': instance.uno_Type_com$sun$star$form$binding$XListEntrySource,
                            'XListEntryTypedSource': instance.uno_Type_com$sun$star$form$binding$XListEntryTypedSource,
                            'XValueBinding': instance.uno_Type_com$sun$star$form$binding$XValueBinding
                        },
                        'component': {
                        },
                        'control': {
                            'FilterControl': {
                                'createWithFormat': instance.uno_Function_com$sun$star$form$control$FilterControl$$createWithFormat
                            }
                        },
                        'inspection': {
                            'DefaultFormComponentInspectorModel': {
                                'createDefault': instance.uno_Function_com$sun$star$form$inspection$DefaultFormComponentInspectorModel$$createDefault,
                                'createWithHelpSection': instance.uno_Function_com$sun$star$form$inspection$DefaultFormComponentInspectorModel$$createWithHelpSection
                            },
                            'FormComponentPropertyHandler': {
                                'create': instance.uno_Function_com$sun$star$form$inspection$FormComponentPropertyHandler$$create
                            }
                        },
                        'runtime': {
                            'FeatureState': instance.uno_Type_com$sun$star$form$runtime$FeatureState,
                            'FilterEvent': instance.uno_Type_com$sun$star$form$runtime$FilterEvent,
                            'XFeatureInvalidation': instance.uno_Type_com$sun$star$form$runtime$XFeatureInvalidation,
                            'XFilterController': instance.uno_Type_com$sun$star$form$runtime$XFilterController,
                            'XFilterControllerListener': instance.uno_Type_com$sun$star$form$runtime$XFilterControllerListener,
                            'XFormController': instance.uno_Type_com$sun$star$form$runtime$XFormController,
                            'XFormControllerContext': instance.uno_Type_com$sun$star$form$runtime$XFormControllerContext,
                            'XFormOperations': instance.uno_Type_com$sun$star$form$runtime$XFormOperations,
                            'FormController': {
                                'create': instance.uno_Function_com$sun$star$form$runtime$FormController$$create
                            },
                            'FormFeature': {
                                'AutoFilter': 15,
                                'DeleteRecord': 10,
                                'InteractiveFilter': 16,
                                'InteractiveSort': 14,
                                'MoveAbsolute': 1,
                                'MoveToFirst': 3,
                                'MoveToInsertRow': 7,
                                'MoveToLast': 6,
                                'MoveToNext': 5,
                                'MoveToPrevious': 4,
                                'RefreshCurrentControl': 19,
                                'ReloadForm': 11,
                                'RemoveFilterAndSort': 18,
                                'SaveRecordChanges': 8,
                                'SortAscending': 12,
                                'SortDescending': 13,
                                'ToggleApplyFilter': 17,
                                'TotalRecords': 2,
                                'UndoRecordChanges': 9
                            },
                            'FormOperations': {
                                'createWithFormController': instance.uno_Function_com$sun$star$form$runtime$FormOperations$$createWithFormController,
                                'createWithForm': instance.uno_Function_com$sun$star$form$runtime$FormOperations$$createWithForm
                            }
                        },
                        'submission': {
                            'XSubmission': instance.uno_Type_com$sun$star$form$submission$XSubmission,
                            'XSubmissionSupplier': instance.uno_Type_com$sun$star$form$submission$XSubmissionSupplier,
                            'XSubmissionVetoListener': instance.uno_Type_com$sun$star$form$submission$XSubmissionVetoListener
                        },
                        'validation': {
                            'XFormComponentValidityListener': instance.uno_Type_com$sun$star$form$validation$XFormComponentValidityListener,
                            'XValidatable': instance.uno_Type_com$sun$star$form$validation$XValidatable,
                            'XValidatableFormComponent': instance.uno_Type_com$sun$star$form$validation$XValidatableFormComponent,
                            'XValidator': instance.uno_Type_com$sun$star$form$validation$XValidator,
                            'XValidityConstraintListener': instance.uno_Type_com$sun$star$form$validation$XValidityConstraintListener
                        }
                    },
                    'formula': {
                        'SymbolDescriptor': instance.uno_Type_com$sun$star$formula$SymbolDescriptor
                    },
                    'frame': {
                        'BorderWidths': instance.uno_Type_com$sun$star$frame$BorderWidths,
                        'ControlCommand': instance.uno_Type_com$sun$star$frame$ControlCommand,
                        'ControlEvent': instance.uno_Type_com$sun$star$frame$ControlEvent,
                        'DispatchDescriptor': instance.uno_Type_com$sun$star$frame$DispatchDescriptor,
                        'DispatchInformation': instance.uno_Type_com$sun$star$frame$DispatchInformation,
                        'DispatchResultEvent': instance.uno_Type_com$sun$star$frame$DispatchResultEvent,
                        'DispatchStatement': instance.uno_Type_com$sun$star$frame$DispatchStatement,
                        'DoubleInitializationException': instance.uno_Type_com$sun$star$frame$DoubleInitializationException,
                        'FeatureStateEvent': instance.uno_Type_com$sun$star$frame$FeatureStateEvent,
                        'FrameAction': instance.uno_Type_com$sun$star$frame$FrameAction,
                        'FrameActionEvent': instance.uno_Type_com$sun$star$frame$FrameActionEvent,
                        'IllegalArgumentIOException': instance.uno_Type_com$sun$star$frame$IllegalArgumentIOException,
                        'TerminationVetoException': instance.uno_Type_com$sun$star$frame$TerminationVetoException,
                        'TitleChangedEvent': instance.uno_Type_com$sun$star$frame$TitleChangedEvent,
                        'UnknownModuleException': instance.uno_Type_com$sun$star$frame$UnknownModuleException,
                        'XAppDispatchProvider': instance.uno_Type_com$sun$star$frame$XAppDispatchProvider,
                        'XBorderResizeListener': instance.uno_Type_com$sun$star$frame$XBorderResizeListener,
                        'XBrowseHistoryRegistry': instance.uno_Type_com$sun$star$frame$XBrowseHistoryRegistry,
                        'XComponentLoader': instance.uno_Type_com$sun$star$frame$XComponentLoader,
                        'XComponentRegistry': instance.uno_Type_com$sun$star$frame$XComponentRegistry,
                        'XConfigManager': instance.uno_Type_com$sun$star$frame$XConfigManager,
                        'XControlNotificationListener': instance.uno_Type_com$sun$star$frame$XControlNotificationListener,
                        'XController': instance.uno_Type_com$sun$star$frame$XController,
                        'XController2': instance.uno_Type_com$sun$star$frame$XController2,
                        'XControllerBorder': instance.uno_Type_com$sun$star$frame$XControllerBorder,
                        'XDesktop': instance.uno_Type_com$sun$star$frame$XDesktop,
                        'XDesktop2': instance.uno_Type_com$sun$star$frame$XDesktop2,
                        'XDesktopTask': instance.uno_Type_com$sun$star$frame$XDesktopTask,
                        'XDispatch': instance.uno_Type_com$sun$star$frame$XDispatch,
                        'XDispatchHelper': instance.uno_Type_com$sun$star$frame$XDispatchHelper,
                        'XDispatchInformationProvider': instance.uno_Type_com$sun$star$frame$XDispatchInformationProvider,
                        'XDispatchProvider': instance.uno_Type_com$sun$star$frame$XDispatchProvider,
                        'XDispatchProviderInterception': instance.uno_Type_com$sun$star$frame$XDispatchProviderInterception,
                        'XDispatchProviderInterceptor': instance.uno_Type_com$sun$star$frame$XDispatchProviderInterceptor,
                        'XDispatchRecorder': instance.uno_Type_com$sun$star$frame$XDispatchRecorder,
                        'XDispatchRecorderSupplier': instance.uno_Type_com$sun$star$frame$XDispatchRecorderSupplier,
                        'XDispatchResultListener': instance.uno_Type_com$sun$star$frame$XDispatchResultListener,
                        'XDocumentTemplates': instance.uno_Type_com$sun$star$frame$XDocumentTemplates,
                        'XExtendedFilterDetection': instance.uno_Type_com$sun$star$frame$XExtendedFilterDetection,
                        'XFilterDetect': instance.uno_Type_com$sun$star$frame$XFilterDetect,
                        'XFrame': instance.uno_Type_com$sun$star$frame$XFrame,
                        'XFrame2': instance.uno_Type_com$sun$star$frame$XFrame2,
                        'XFrameActionListener': instance.uno_Type_com$sun$star$frame$XFrameActionListener,
                        'XFrameLoader': instance.uno_Type_com$sun$star$frame$XFrameLoader,
                        'XFrameLoaderQuery': instance.uno_Type_com$sun$star$frame$XFrameLoaderQuery,
                        'XFrameSetModel': instance.uno_Type_com$sun$star$frame$XFrameSetModel,
                        'XFrames': instance.uno_Type_com$sun$star$frame$XFrames,
                        'XFramesSupplier': instance.uno_Type_com$sun$star$frame$XFramesSupplier,
                        'XGlobalEventBroadcaster': instance.uno_Type_com$sun$star$frame$XGlobalEventBroadcaster,
                        'XInfobarProvider': instance.uno_Type_com$sun$star$frame$XInfobarProvider,
                        'XInterceptorInfo': instance.uno_Type_com$sun$star$frame$XInterceptorInfo,
                        'XLayoutManager': instance.uno_Type_com$sun$star$frame$XLayoutManager,
                        'XLayoutManager2': instance.uno_Type_com$sun$star$frame$XLayoutManager2,
                        'XLayoutManagerEventBroadcaster': instance.uno_Type_com$sun$star$frame$XLayoutManagerEventBroadcaster,
                        'XLayoutManagerListener': instance.uno_Type_com$sun$star$frame$XLayoutManagerListener,
                        'XLoadEventListener': instance.uno_Type_com$sun$star$frame$XLoadEventListener,
                        'XLoadable': instance.uno_Type_com$sun$star$frame$XLoadable,
                        'XLoaderFactory': instance.uno_Type_com$sun$star$frame$XLoaderFactory,
                        'XMenuBarAcceptor': instance.uno_Type_com$sun$star$frame$XMenuBarAcceptor,
                        'XMenuBarMergingAcceptor': instance.uno_Type_com$sun$star$frame$XMenuBarMergingAcceptor,
                        'XModel': instance.uno_Type_com$sun$star$frame$XModel,
                        'XModel2': instance.uno_Type_com$sun$star$frame$XModel2,
                        'XModel3': instance.uno_Type_com$sun$star$frame$XModel3,
                        'XModule': instance.uno_Type_com$sun$star$frame$XModule,
                        'XModuleManager': instance.uno_Type_com$sun$star$frame$XModuleManager,
                        'XModuleManager2': instance.uno_Type_com$sun$star$frame$XModuleManager2,
                        'XNotifyingDispatch': instance.uno_Type_com$sun$star$frame$XNotifyingDispatch,
                        'XPopupMenuController': instance.uno_Type_com$sun$star$frame$XPopupMenuController,
                        'XRecordableDispatch': instance.uno_Type_com$sun$star$frame$XRecordableDispatch,
                        'XSessionManagerClient': instance.uno_Type_com$sun$star$frame$XSessionManagerClient,
                        'XSessionManagerListener': instance.uno_Type_com$sun$star$frame$XSessionManagerListener,
                        'XSessionManagerListener2': instance.uno_Type_com$sun$star$frame$XSessionManagerListener2,
                        'XStatusListener': instance.uno_Type_com$sun$star$frame$XStatusListener,
                        'XStatusbarController': instance.uno_Type_com$sun$star$frame$XStatusbarController,
                        'XStorable': instance.uno_Type_com$sun$star$frame$XStorable,
                        'XStorable2': instance.uno_Type_com$sun$star$frame$XStorable2,
                        'XSubToolbarController': instance.uno_Type_com$sun$star$frame$XSubToolbarController,
                        'XSynchronousDispatch': instance.uno_Type_com$sun$star$frame$XSynchronousDispatch,
                        'XSynchronousFrameLoader': instance.uno_Type_com$sun$star$frame$XSynchronousFrameLoader,
                        'XTask': instance.uno_Type_com$sun$star$frame$XTask,
                        'XTasksSupplier': instance.uno_Type_com$sun$star$frame$XTasksSupplier,
                        'XTerminateListener': instance.uno_Type_com$sun$star$frame$XTerminateListener,
                        'XTerminateListener2': instance.uno_Type_com$sun$star$frame$XTerminateListener2,
                        'XTitle': instance.uno_Type_com$sun$star$frame$XTitle,
                        'XTitleChangeBroadcaster': instance.uno_Type_com$sun$star$frame$XTitleChangeBroadcaster,
                        'XTitleChangeListener': instance.uno_Type_com$sun$star$frame$XTitleChangeListener,
                        'XToolbarController': instance.uno_Type_com$sun$star$frame$XToolbarController,
                        'XToolbarControllerListener': instance.uno_Type_com$sun$star$frame$XToolbarControllerListener,
                        'XTransientDocumentsDocumentContentFactory': instance.uno_Type_com$sun$star$frame$XTransientDocumentsDocumentContentFactory,
                        'XTransientDocumentsDocumentContentIdentifierFactory': instance.uno_Type_com$sun$star$frame$XTransientDocumentsDocumentContentIdentifierFactory,
                        'XUIControllerFactory': instance.uno_Type_com$sun$star$frame$XUIControllerFactory,
                        'XUIControllerRegistration': instance.uno_Type_com$sun$star$frame$XUIControllerRegistration,
                        'XUntitledNumbers': instance.uno_Type_com$sun$star$frame$XUntitledNumbers,
                        'XUrlList': instance.uno_Type_com$sun$star$frame$XUrlList,
                        'XWindowArranger': instance.uno_Type_com$sun$star$frame$XWindowArranger,
                        'theAutoRecovery': instance.uno_Function_com$sun$star$frame$theAutoRecovery,
                        'theDesktop': instance.uno_Function_com$sun$star$frame$theDesktop,
                        'theGlobalEventBroadcaster': instance.uno_Function_com$sun$star$frame$theGlobalEventBroadcaster,
                        'thePopupMenuControllerFactory': instance.uno_Function_com$sun$star$frame$thePopupMenuControllerFactory,
                        'theStatusbarControllerFactory': instance.uno_Function_com$sun$star$frame$theStatusbarControllerFactory,
                        'theToolbarControllerFactory': instance.uno_Function_com$sun$star$frame$theToolbarControllerFactory,
                        'theUICommandDescription': instance.uno_Function_com$sun$star$frame$theUICommandDescription,
                        'AppDispatchProvider': {
                            'create': instance.uno_Function_com$sun$star$frame$AppDispatchProvider$$create
                        },
                        'AutoRecovery': {
                            'create': instance.uno_Function_com$sun$star$frame$AutoRecovery$$create
                        },
                        'Bibliography': {
                            'create': instance.uno_Function_com$sun$star$frame$Bibliography$$create
                        },
                        'CommandGroup': {
                            'APPLICATION': 1,
                            'CHART': 20,
                            'CONNECTOR': 22,
                            'CONTROLS': 25,
                            'DATA': 17,
                            'DOCUMENT': 3,
                            'DRAWING': 24,
                            'EDIT': 4,
                            'ENUMERATION': 16,
                            'EXPLORER': 21,
                            'FORMAT': 10,
                            'FRAME': 13,
                            'GRAPHIC': 14,
                            'IMAGE': 19,
                            'INSERT': 9,
                            'INTERNAL': 0,
                            'MACRO': 5,
                            'MATH': 7,
                            'MODIFY': 23,
                            'NAVIGATOR': 8,
                            'OPTIONS': 6,
                            'SPECIAL': 18,
                            'TABLE': 15,
                            'TEMPLATE': 11,
                            'TEXT': 12,
                            'VIEW': 2
                        },
                        'ContentHandlerFactory': {
                            'create': instance.uno_Function_com$sun$star$frame$ContentHandlerFactory$$create
                        },
                        'Desktop': {
                            'create': instance.uno_Function_com$sun$star$frame$Desktop$$create
                        },
                        'DispatchHelper': {
                            'create': instance.uno_Function_com$sun$star$frame$DispatchHelper$$create
                        },
                        'DispatchRecorder': {
                            'create': instance.uno_Function_com$sun$star$frame$DispatchRecorder$$create
                        },
                        'DispatchRecorderSupplier': {
                            'create': instance.uno_Function_com$sun$star$frame$DispatchRecorderSupplier$$create
                        },
                        'DispatchResultState': {
                            'DONTKNOW': 2,
                            'FAILURE': 0,
                            'SUCCESS': 1
                        },
                        'DocumentTemplates': {
                            'create': instance.uno_Function_com$sun$star$frame$DocumentTemplates$$create
                        },
                        'Frame': {
                            'create': instance.uno_Function_com$sun$star$frame$Frame$$create
                        },
                        'FrameLoaderFactory': {
                            'create': instance.uno_Function_com$sun$star$frame$FrameLoaderFactory$$create
                        },
                        'FrameSearchFlag': {
                            'ALL': 23,
                            'AUTO': 0,
                            'CHILDREN': 4,
                            'CREATE': 8,
                            'GLOBAL': 55,
                            'PARENT': 1,
                            'SELF': 2,
                            'SIBLINGS': 16,
                            'TASKS': 32
                        },
                        'GlobalEventBroadcaster': {
                            'create': instance.uno_Function_com$sun$star$frame$GlobalEventBroadcaster$$create
                        },
                        'InfobarType': {
                            'DANGER': 3,
                            'INFO': 0,
                            'SUCCESS': 1,
                            'WARNING': 2
                        },
                        'LayoutManager': {
                            'create': instance.uno_Function_com$sun$star$frame$LayoutManager$$create
                        },
                        'LayoutManagerEvents': {
                            'INVISIBLE': 4,
                            'LAYOUT': 2,
                            'LOCK': 0,
                            'MERGEDMENUBAR': 5,
                            'UIELEMENT_INVISIBLE': 7,
                            'UIELEMENT_VISIBLE': 6,
                            'UNLOCK': 1,
                            'VISIBLE': 3
                        },
                        'MediaTypeDetectionHelper': {
                            'create': instance.uno_Function_com$sun$star$frame$MediaTypeDetectionHelper$$create
                        },
                        'ModuleManager': {
                            'create': instance.uno_Function_com$sun$star$frame$ModuleManager$$create
                        },
                        'OfficeFrameLoader': {
                            'create': instance.uno_Function_com$sun$star$frame$OfficeFrameLoader$$create
                        },
                        'PopupMenuControllerFactory': {
                            'create': instance.uno_Function_com$sun$star$frame$PopupMenuControllerFactory$$create
                        },
                        'SessionListener': {
                            'createWithOnQuitFlag': instance.uno_Function_com$sun$star$frame$SessionListener$$createWithOnQuitFlag
                        },
                        'StartModule': {
                            'createWithParentWindow': instance.uno_Function_com$sun$star$frame$StartModule$$createWithParentWindow
                        },
                        'StatusbarControllerFactory': {
                            'create': instance.uno_Function_com$sun$star$frame$StatusbarControllerFactory$$create
                        },
                        'TaskCreator': {
                            'create': instance.uno_Function_com$sun$star$frame$TaskCreator$$create
                        },
                        'ToolbarControllerFactory': {
                            'create': instance.uno_Function_com$sun$star$frame$ToolbarControllerFactory$$create
                        },
                        'UICommandDescription': {
                            'create': instance.uno_Function_com$sun$star$frame$UICommandDescription$$create
                        },
                        'UntitledNumbersConst': {
                            'INVALID_NUMBER': 0
                        },
                        'WindowArrange': {
                            'CASCADE': 4,
                            'HORIZONTAL': 3,
                            'MAXIMIZE': 5,
                            'MINIMIZE': 6,
                            'TILE': 1,
                            'VERTICAL': 2
                        },
                        'status': {
                            'ClipboardFormats': instance.uno_Type_com$sun$star$frame$status$ClipboardFormats,
                            'FontHeight': instance.uno_Type_com$sun$star$frame$status$FontHeight,
                            'ItemStatus': instance.uno_Type_com$sun$star$frame$status$ItemStatus,
                            'LeftRightMargin': instance.uno_Type_com$sun$star$frame$status$LeftRightMargin,
                            'LeftRightMarginScale': instance.uno_Type_com$sun$star$frame$status$LeftRightMarginScale,
                            'Template': instance.uno_Type_com$sun$star$frame$status$Template,
                            'UpperLowerMargin': instance.uno_Type_com$sun$star$frame$status$UpperLowerMargin,
                            'UpperLowerMarginScale': instance.uno_Type_com$sun$star$frame$status$UpperLowerMarginScale,
                            'Verb': instance.uno_Type_com$sun$star$frame$status$Verb,
                            'Visibility': instance.uno_Type_com$sun$star$frame$status$Visibility,
                            'ItemState': {
                                'DEFAULT_VALUE': 32,
                                'DISABLED': 1,
                                'DONT_CARE': 16,
                                'READ_ONLY': 2,
                                'SET': 64,
                                'UNKNOWN': 0
                            }
                        }
                    },
                    'gallery': {
                        'XGalleryItem': instance.uno_Type_com$sun$star$gallery$XGalleryItem,
                        'XGalleryTheme': instance.uno_Type_com$sun$star$gallery$XGalleryTheme,
                        'XGalleryThemeProvider': instance.uno_Type_com$sun$star$gallery$XGalleryThemeProvider,
                        'GalleryItemType': {
                            'DRAWING': 3,
                            'EMPTY': 0,
                            'GRAPHIC': 1,
                            'MEDIA': 2
                        }
                    },
                    'geometry': {
                        'AffineMatrix2D': instance.uno_Type_com$sun$star$geometry$AffineMatrix2D,
                        'AffineMatrix3D': instance.uno_Type_com$sun$star$geometry$AffineMatrix3D,
                        'EllipticalArc': instance.uno_Type_com$sun$star$geometry$EllipticalArc,
                        'IntegerBezierSegment2D': instance.uno_Type_com$sun$star$geometry$IntegerBezierSegment2D,
                        'IntegerPoint2D': instance.uno_Type_com$sun$star$geometry$IntegerPoint2D,
                        'IntegerRectangle2D': instance.uno_Type_com$sun$star$geometry$IntegerRectangle2D,
                        'IntegerSize2D': instance.uno_Type_com$sun$star$geometry$IntegerSize2D,
                        'Matrix2D': instance.uno_Type_com$sun$star$geometry$Matrix2D,
                        'RealBezierSegment2D': instance.uno_Type_com$sun$star$geometry$RealBezierSegment2D,
                        'RealPoint2D': instance.uno_Type_com$sun$star$geometry$RealPoint2D,
                        'RealRectangle2D': instance.uno_Type_com$sun$star$geometry$RealRectangle2D,
                        'RealRectangle3D': instance.uno_Type_com$sun$star$geometry$RealRectangle3D,
                        'RealSize2D': instance.uno_Type_com$sun$star$geometry$RealSize2D,
                        'XMapping2D': instance.uno_Type_com$sun$star$geometry$XMapping2D
                    },
                    'graphic': {
                        'XEmfParser': instance.uno_Type_com$sun$star$graphic$XEmfParser,
                        'XGraphic': instance.uno_Type_com$sun$star$graphic$XGraphic,
                        'XGraphicMapper': instance.uno_Type_com$sun$star$graphic$XGraphicMapper,
                        'XGraphicObject': instance.uno_Type_com$sun$star$graphic$XGraphicObject,
                        'XGraphicProvider': instance.uno_Type_com$sun$star$graphic$XGraphicProvider,
                        'XGraphicProvider2': instance.uno_Type_com$sun$star$graphic$XGraphicProvider2,
                        'XGraphicRasterizer': instance.uno_Type_com$sun$star$graphic$XGraphicRasterizer,
                        'XGraphicRenderer': instance.uno_Type_com$sun$star$graphic$XGraphicRenderer,
                        'XGraphicTransformer': instance.uno_Type_com$sun$star$graphic$XGraphicTransformer,
                        'XPdfDecomposer': instance.uno_Type_com$sun$star$graphic$XPdfDecomposer,
                        'XPrimitive2D': instance.uno_Type_com$sun$star$graphic$XPrimitive2D,
                        'XPrimitive2DRenderer': instance.uno_Type_com$sun$star$graphic$XPrimitive2DRenderer,
                        'XPrimitive3D': instance.uno_Type_com$sun$star$graphic$XPrimitive3D,
                        'XPrimitiveFactory2D': instance.uno_Type_com$sun$star$graphic$XPrimitiveFactory2D,
                        'XSvgParser': instance.uno_Type_com$sun$star$graphic$XSvgParser,
                        'EmfTools': {
                            'create': instance.uno_Function_com$sun$star$graphic$EmfTools$$create
                        },
                        'GraphicColorMode': {
                            'HIGH_CONTRAST': 1,
                            'NORMAL': 0
                        },
                        'GraphicMapper': {
                            'create': instance.uno_Function_com$sun$star$graphic$GraphicMapper$$create
                        },
                        'GraphicObject': {
                            'create': instance.uno_Function_com$sun$star$graphic$GraphicObject$$create
                        },
                        'GraphicProvider': {
                            'create': instance.uno_Function_com$sun$star$graphic$GraphicProvider$$create
                        },
                        'GraphicType': {
                            'EMPTY': 0,
                            'PIXEL': 1,
                            'VECTOR': 2
                        },
                        'PdfTools': {
                            'create': instance.uno_Function_com$sun$star$graphic$PdfTools$$create
                        },
                        'Primitive2DTools': {
                            'create': instance.uno_Function_com$sun$star$graphic$Primitive2DTools$$create
                        },
                        'PrimitiveFactory2D': {
                            'create': instance.uno_Function_com$sun$star$graphic$PrimitiveFactory2D$$create
                        },
                        'SvgTools': {
                            'create': instance.uno_Function_com$sun$star$graphic$SvgTools$$create
                        }
                    },
                    'i18n': {
                        'Boundary': instance.uno_Type_com$sun$star$i18n$Boundary,
                        'Calendar': instance.uno_Type_com$sun$star$i18n$Calendar,
                        'Calendar2': instance.uno_Type_com$sun$star$i18n$Calendar2,
                        'CalendarItem': instance.uno_Type_com$sun$star$i18n$CalendarItem,
                        'CalendarItem2': instance.uno_Type_com$sun$star$i18n$CalendarItem2,
                        'Currency': instance.uno_Type_com$sun$star$i18n$Currency,
                        'Currency2': instance.uno_Type_com$sun$star$i18n$Currency2,
                        'DirectionProperty': instance.uno_Type_com$sun$star$i18n$DirectionProperty,
                        'ForbiddenCharacters': instance.uno_Type_com$sun$star$i18n$ForbiddenCharacters,
                        'FormatElement': instance.uno_Type_com$sun$star$i18n$FormatElement,
                        'Implementation': instance.uno_Type_com$sun$star$i18n$Implementation,
                        'LanguageCountryInfo': instance.uno_Type_com$sun$star$i18n$LanguageCountryInfo,
                        'LineBreakHyphenationOptions': instance.uno_Type_com$sun$star$i18n$LineBreakHyphenationOptions,
                        'LineBreakResults': instance.uno_Type_com$sun$star$i18n$LineBreakResults,
                        'LineBreakUserOptions': instance.uno_Type_com$sun$star$i18n$LineBreakUserOptions,
                        'LocaleDataItem': instance.uno_Type_com$sun$star$i18n$LocaleDataItem,
                        'LocaleDataItem2': instance.uno_Type_com$sun$star$i18n$LocaleDataItem2,
                        'MultipleCharsOutputException': instance.uno_Type_com$sun$star$i18n$MultipleCharsOutputException,
                        'NativeNumberXmlAttributes': instance.uno_Type_com$sun$star$i18n$NativeNumberXmlAttributes,
                        'NativeNumberXmlAttributes2': instance.uno_Type_com$sun$star$i18n$NativeNumberXmlAttributes2,
                        'NumberFormatCode': instance.uno_Type_com$sun$star$i18n$NumberFormatCode,
                        'ParseResult': instance.uno_Type_com$sun$star$i18n$ParseResult,
                        'TextConversionResult': instance.uno_Type_com$sun$star$i18n$TextConversionResult,
                        'TransliterationModules': instance.uno_Type_com$sun$star$i18n$TransliterationModules,
                        'TransliterationModulesNew': instance.uno_Type_com$sun$star$i18n$TransliterationModulesNew,
                        'UnicodeScript': instance.uno_Type_com$sun$star$i18n$UnicodeScript,
                        'XBreakIterator': instance.uno_Type_com$sun$star$i18n$XBreakIterator,
                        'XCalendar': instance.uno_Type_com$sun$star$i18n$XCalendar,
                        'XCalendar3': instance.uno_Type_com$sun$star$i18n$XCalendar3,
                        'XCalendar4': instance.uno_Type_com$sun$star$i18n$XCalendar4,
                        'XCharacterClassification': instance.uno_Type_com$sun$star$i18n$XCharacterClassification,
                        'XCollator': instance.uno_Type_com$sun$star$i18n$XCollator,
                        'XExtendedCalendar': instance.uno_Type_com$sun$star$i18n$XExtendedCalendar,
                        'XExtendedIndexEntrySupplier': instance.uno_Type_com$sun$star$i18n$XExtendedIndexEntrySupplier,
                        'XExtendedInputSequenceChecker': instance.uno_Type_com$sun$star$i18n$XExtendedInputSequenceChecker,
                        'XExtendedTextConversion': instance.uno_Type_com$sun$star$i18n$XExtendedTextConversion,
                        'XExtendedTransliteration': instance.uno_Type_com$sun$star$i18n$XExtendedTransliteration,
                        'XForbiddenCharacters': instance.uno_Type_com$sun$star$i18n$XForbiddenCharacters,
                        'XIndexEntrySupplier': instance.uno_Type_com$sun$star$i18n$XIndexEntrySupplier,
                        'XInputSequenceChecker': instance.uno_Type_com$sun$star$i18n$XInputSequenceChecker,
                        'XLocaleData': instance.uno_Type_com$sun$star$i18n$XLocaleData,
                        'XLocaleData2': instance.uno_Type_com$sun$star$i18n$XLocaleData2,
                        'XLocaleData3': instance.uno_Type_com$sun$star$i18n$XLocaleData3,
                        'XLocaleData4': instance.uno_Type_com$sun$star$i18n$XLocaleData4,
                        'XLocaleData5': instance.uno_Type_com$sun$star$i18n$XLocaleData5,
                        'XNativeNumberSupplier': instance.uno_Type_com$sun$star$i18n$XNativeNumberSupplier,
                        'XNativeNumberSupplier2': instance.uno_Type_com$sun$star$i18n$XNativeNumberSupplier2,
                        'XNumberFormatCode': instance.uno_Type_com$sun$star$i18n$XNumberFormatCode,
                        'XOrdinalSuffix': instance.uno_Type_com$sun$star$i18n$XOrdinalSuffix,
                        'XScriptTypeDetector': instance.uno_Type_com$sun$star$i18n$XScriptTypeDetector,
                        'XTextConversion': instance.uno_Type_com$sun$star$i18n$XTextConversion,
                        'XTransliteration': instance.uno_Type_com$sun$star$i18n$XTransliteration,
                        'AmPmValue': {
                            'AM': 0,
                            'PM': 1
                        },
                        'BreakIterator': {
                            'create': instance.uno_Function_com$sun$star$i18n$BreakIterator$$create
                        },
                        'BreakType': {
                            'HANGINGPUNCTUATION': 3,
                            'HYPHENATION': 2,
                            'WORDBOUNDARY': 1
                        },
                        'CTLScriptType': {
                            'CTL_ARABIC': 2,
                            'CTL_HEBREW': 1,
                            'CTL_INDIC': 4,
                            'CTL_THAI': 3,
                            'CTL_UNKNOWN': 0
                        },
                        'CalendarDisplayCode': {
                            'LONG_DAY': 2,
                            'LONG_DAY_NAME': 4,
                            'LONG_ERA': 12,
                            'LONG_GENITIVE_MONTH_NAME': 18,
                            'LONG_MONTH': 6,
                            'LONG_MONTH_NAME': 8,
                            'LONG_PARTITIVE_MONTH_NAME': 21,
                            'LONG_QUARTER': 16,
                            'LONG_YEAR': 10,
                            'LONG_YEAR_AND_ERA': 14,
                            'NARROW_DAY_NAME': 23,
                            'NARROW_GENITIVE_MONTH_NAME': 19,
                            'NARROW_MONTH_NAME': 24,
                            'NARROW_PARTITIVE_MONTH_NAME': 22,
                            'SHORT_DAY': 1,
                            'SHORT_DAY_NAME': 3,
                            'SHORT_ERA': 11,
                            'SHORT_GENITIVE_MONTH_NAME': 17,
                            'SHORT_MONTH': 5,
                            'SHORT_MONTH_NAME': 7,
                            'SHORT_PARTITIVE_MONTH_NAME': 20,
                            'SHORT_QUARTER': 15,
                            'SHORT_YEAR': 9,
                            'SHORT_YEAR_AND_ERA': 13
                        },
                        'CalendarDisplayIndex': {
                            'AM_PM': 0,
                            'DAY': 1,
                            'ERA': 4,
                            'GENITIVE_MONTH': 5,
                            'MONTH': 2,
                            'PARTITIVE_MONTH': 6,
                            'YEAR': 3
                        },
                        'CalendarFieldIndex': {
                            'AM_PM': 0,
                            'DAY_OF_MONTH': 1,
                            'DAY_OF_WEEK': 2,
                            'DAY_OF_YEAR': 3,
                            'DST_OFFSET': 4,
                            'DST_OFFSET_SECOND_MILLIS': 16,
                            'ERA': 13,
                            'FIELD_COUNT': 15,
                            'FIELD_COUNT2': 17,
                            'HOUR': 5,
                            'MILLISECOND': 8,
                            'MINUTE': 6,
                            'MONTH': 12,
                            'SECOND': 7,
                            'WEEK_OF_MONTH': 9,
                            'WEEK_OF_YEAR': 10,
                            'YEAR': 11,
                            'ZONE_OFFSET': 14,
                            'ZONE_OFFSET_SECOND_MILLIS': 15
                        },
                        'ChapterCollator': {
                            'create': instance.uno_Function_com$sun$star$i18n$ChapterCollator$$create
                        },
                        'CharType': {
                            'ANY_CHAR': 0,
                            'COMBINING_SPACING_MARK': 8,
                            'CONNECTOR_PUNCTUATION': 22,
                            'CONTROL': 15,
                            'CURRENCY_SYMBOL': 25,
                            'DASH_PUNCTUATION': 19,
                            'DECIMAL_DIGIT_NUMBER': 9,
                            'ENCLOSING_MARK': 7,
                            'END_PUNCTUATION': 21,
                            'FINAL_PUNCTUATION': 29,
                            'FORMAT': 16,
                            'GENERAL_TYPES_COUNT': 30,
                            'INITIAL_PUNCTUATION': 28,
                            'LETTER_NUMBER': 10,
                            'LINE_SEPARATOR': 13,
                            'LOWERCASE_LETTER': 2,
                            'MATH_SYMBOL': 24,
                            'MODIFIER_LETTER': 4,
                            'MODIFIER_SYMBOL': 26,
                            'NON_SPACING_MARK': 6,
                            'OTHER_LETTER': 5,
                            'OTHER_NUMBER': 11,
                            'OTHER_PUNCTUATION': 23,
                            'OTHER_SYMBOL': 27,
                            'PARAGRAPH_SEPARATOR': 14,
                            'PRIVATE_USE': 17,
                            'SPACE_SEPARATOR': 12,
                            'START_PUNCTUATION': 20,
                            'SURROGATE': 18,
                            'TITLECASE_LETTER': 3,
                            'UPPERCASE_LETTER': 1
                        },
                        'CharacterClassification': {
                            'create': instance.uno_Function_com$sun$star$i18n$CharacterClassification$$create
                        },
                        'CharacterIteratorMode': {
                            'SKIPCELL': 1,
                            'SKIPCHARACTER': 0,
                            'SKIPCONTROLCHARACTER': 2
                        },
                        'Collator': {
                            'create': instance.uno_Function_com$sun$star$i18n$Collator$$create
                        },
                        'CollatorOptions': {
                            'CollatorOptions_IGNORE_CASE': 1,
                            'CollatorOptions_IGNORE_CASE_ACCENT': 8,
                            'CollatorOptions_IGNORE_KANA': 2,
                            'CollatorOptions_IGNORE_WIDTH': 4
                        },
                        'IndexEntrySupplier': {
                            'create': instance.uno_Function_com$sun$star$i18n$IndexEntrySupplier$$create
                        },
                        'InputSequenceCheckMode': {
                            'BASIC': 1,
                            'PASSTHROUGH': 0,
                            'STRICT': 2
                        },
                        'InputSequenceChecker': {
                            'create': instance.uno_Function_com$sun$star$i18n$InputSequenceChecker$$create
                        },
                        'KCharacterType': {
                            'ALPHA': 14,
                            'BASE_FORM': 64,
                            'CONTROL': 16,
                            'DIGIT': 1,
                            'LETTER': 128,
                            'LOWER': 4,
                            'PRINTABLE': 32,
                            'TITLE_CASE': 8,
                            'UPPER': 2
                        },
                        'KNumberFormatType': {
                            'LONG': 3,
                            'MEDIUM': 2,
                            'SHORT': 1
                        },
                        'KNumberFormatUsage': {
                            'CURRENCY': 8,
                            'DATE': 1,
                            'DATE_TIME': 3,
                            'FIXED_NUMBER': 4,
                            'FRACTION_NUMBER': 5,
                            'PERCENT_NUMBER': 6,
                            'SCIENTIFIC_NUMBER': 7,
                            'TIME': 2
                        },
                        'KParseTokens': {
                            'ANY_ALNUM': 61447,
                            'ANY_ALPHA': 45059,
                            'ANY_DIGIT': 16388,
                            'ANY_LETTER': 241667,
                            'ANY_LETTER_OR_NUMBER': 1044487,
                            'ANY_NUMBER': 802820,
                            'ASC_ALNUM': 7,
                            'ASC_ALPHA': 3,
                            'ASC_ANY_BUT_CONTROL': 1024,
                            'ASC_COLON': 64,
                            'ASC_CONTROL': 512,
                            'ASC_DIGIT': 4,
                            'ASC_DOLLAR': 16,
                            'ASC_DOT': 32,
                            'ASC_LOALPHA': 2,
                            'ASC_OTHER': 2048,
                            'ASC_UNDERSCORE': 8,
                            'ASC_UPALPHA': 1,
                            'GROUP_SEPARATOR_IN_NUMBER': 134217728,
                            'GROUP_SEPARATOR_IN_NUMBER_3': 67108864,
                            'IGNORE_LEADING_WS': 1073741824,
                            'TWO_DOUBLE_QUOTES_BREAK_STRING': 268435456,
                            'UNI_ALNUM': 61440,
                            'UNI_ALPHA': 45056,
                            'UNI_DIGIT': 16384,
                            'UNI_LETTER': 241664,
                            'UNI_LETTER_NUMBER': 262144,
                            'UNI_LOALPHA': 8192,
                            'UNI_MODIFIER_LETTER': 65536,
                            'UNI_NUMBER': 802816,
                            'UNI_OTHER': 536870912,
                            'UNI_OTHER_LETTER': 131072,
                            'UNI_OTHER_NUMBER': 524288,
                            'UNI_TITLE_ALPHA': 32768,
                            'UNI_UPALPHA': 4096
                        },
                        'KParseType': {
                            'ANY_NUMBER': 96,
                            'ASC_NUMBER': 32,
                            'BOOLEAN': 2,
                            'DOUBLE_QUOTE_STRING': 16,
                            'IDENTNAME': 4,
                            'MISSING_QUOTE': 1073741824,
                            'ONE_SINGLE_CHAR': 1,
                            'SINGLE_QUOTE_NAME': 8,
                            'UNI_NUMBER': 64
                        },
                        'LocaleCalendar': {
                            'create': instance.uno_Function_com$sun$star$i18n$LocaleCalendar$$create
                        },
                        'LocaleCalendar2': {
                            'create': instance.uno_Function_com$sun$star$i18n$LocaleCalendar2$$create
                        },
                        'LocaleData': {
                            'create': instance.uno_Function_com$sun$star$i18n$LocaleData$$create
                        },
                        'LocaleData2': {
                            'create': instance.uno_Function_com$sun$star$i18n$LocaleData2$$create
                        },
                        'LocaleItem': {
                            'COUNT': 17,
                            'COUNT2': 18,
                            'DATE_SEPARATOR': 0,
                            'DECIMAL_SEPARATOR': 2,
                            'DECIMAL_SEPARATOR_ALTERNATIVE': 17,
                            'DOUBLE_QUOTATION_END': 9,
                            'DOUBLE_QUOTATION_START': 8,
                            'LIST_SEPARATOR': 5,
                            'LONG_DATE_DAY_OF_WEEK_SEPARATOR': 13,
                            'LONG_DATE_DAY_SEPARATOR': 14,
                            'LONG_DATE_MONTH_SEPARATOR': 15,
                            'LONG_DATE_YEAR_SEPARATOR': 16,
                            'MEASUREMENT_SYSTEM': 10,
                            'SINGLE_QUOTATION_END': 7,
                            'SINGLE_QUOTATION_START': 6,
                            'THOUSAND_SEPARATOR': 1,
                            'TIME_100SEC_SEPARATOR': 4,
                            'TIME_AM': 11,
                            'TIME_PM': 12,
                            'TIME_SEPARATOR': 3
                        },
                        'Months': {
                            'APRIL': 3,
                            'AUGUST': 7,
                            'DECEMBER': 11,
                            'FEBURARY': 1,
                            'JANUARY': 0,
                            'JULY': 6,
                            'JUNE': 5,
                            'MARCH': 2,
                            'MAY': 4,
                            'NOVEMBER': 10,
                            'OCTOBER': 9,
                            'SEPTEMBER': 8
                        },
                        'NativeNumberMode': {
                            'NATNUM0': 0,
                            'NATNUM1': 1,
                            'NATNUM10': 10,
                            'NATNUM11': 11,
                            'NATNUM12': 12,
                            'NATNUM2': 2,
                            'NATNUM3': 3,
                            'NATNUM4': 4,
                            'NATNUM5': 5,
                            'NATNUM6': 6,
                            'NATNUM7': 7,
                            'NATNUM8': 8,
                            'NATNUM9': 9
                        },
                        'NativeNumberSupplier': {
                            'create': instance.uno_Function_com$sun$star$i18n$NativeNumberSupplier$$create
                        },
                        'NativeNumberSupplier2': {
                            'create': instance.uno_Function_com$sun$star$i18n$NativeNumberSupplier2$$create
                        },
                        'NumberFormatIndex': {
                            'BOOLEAN': 48,
                            'CURRENCY_1000DEC2': 13,
                            'CURRENCY_1000DEC2_CCC': 16,
                            'CURRENCY_1000DEC2_DASHED': 17,
                            'CURRENCY_1000DEC2_RED': 15,
                            'CURRENCY_1000INT': 12,
                            'CURRENCY_1000INT_RED': 14,
                            'CURRENCY_END': 17,
                            'CURRENCY_START': 12,
                            'DATETIME_END': 47,
                            'DATETIME_START': 46,
                            'DATETIME_SYSTEM_SHORT_HHMM': 46,
                            'DATETIME_SYS_DDMMYYYY_HHMMSS': 47,
                            'DATE_DEF_NNDDMMMYY': 28,
                            'DATE_DIN_DMMMMYYYY': 26,
                            'DATE_DIN_DMMMYYYY': 24,
                            'DATE_DIN_MMDD': 31,
                            'DATE_DIN_YYMMDD': 32,
                            'DATE_DIN_YYYYMMDD': 33,
                            'DATE_END': 38,
                            'DATE_MMMM': 36,
                            'DATE_QQJJ': 37,
                            'DATE_START': 18,
                            'DATE_SYSTEM_LONG': 19,
                            'DATE_SYSTEM_SHORT': 18,
                            'DATE_SYS_DDMMM': 35,
                            'DATE_SYS_DDMMYY': 20,
                            'DATE_SYS_DDMMYYYY': 21,
                            'DATE_SYS_DMMMMYYYY': 25,
                            'DATE_SYS_DMMMYY': 22,
                            'DATE_SYS_DMMMYYYY': 23,
                            'DATE_SYS_MMYY': 34,
                            'DATE_SYS_NNDMMMMYYYY': 29,
                            'DATE_SYS_NNDMMMYY': 27,
                            'DATE_SYS_NNNNDMMMMYYYY': 30,
                            'DATE_WW': 38,
                            'FRACTION_1': 10,
                            'FRACTION_2': 11,
                            'FRACTION_END': 11,
                            'FRACTION_START': 10,
                            'INDEX_TABLE_ENTRIES': 50,
                            'NUMBER_1000DEC2': 4,
                            'NUMBER_1000INT': 3,
                            'NUMBER_DEC2': 2,
                            'NUMBER_END': 5,
                            'NUMBER_INT': 1,
                            'NUMBER_STANDARD': 0,
                            'NUMBER_START': 0,
                            'NUMBER_SYSTEM': 5,
                            'PERCENT_DEC2': 9,
                            'PERCENT_END': 9,
                            'PERCENT_INT': 8,
                            'PERCENT_START': 8,
                            'SCIENTIFIC_000E00': 7,
                            'SCIENTIFIC_000E000': 6,
                            'SCIENTIFIC_END': 7,
                            'SCIENTIFIC_START': 6,
                            'TEXT': 49,
                            'TIME_END': 45,
                            'TIME_HHMM': 39,
                            'TIME_HHMMAMPM': 41,
                            'TIME_HHMMSS': 40,
                            'TIME_HHMMSSAMPM': 42,
                            'TIME_HH_MMSS': 43,
                            'TIME_HH_MMSS00': 45,
                            'TIME_MMSS00': 44,
                            'TIME_START': 39
                        },
                        'NumberFormatMapper': {
                            'create': instance.uno_Function_com$sun$star$i18n$NumberFormatMapper$$create
                        },
                        'OrdinalSuffix': {
                            'create': instance.uno_Function_com$sun$star$i18n$OrdinalSuffix$$create
                        },
                        'ScriptDirection': {
                            'LEFT_TO_RIGHT': 1,
                            'NEUTRAL': 0,
                            'RIGHT_TO_LEFT': 2
                        },
                        'ScriptType': {
                            'ASIAN': 2,
                            'COMPLEX': 3,
                            'LATIN': 1,
                            'WEAK': 4
                        },
                        'TextConversion': {
                            'create': instance.uno_Function_com$sun$star$i18n$TextConversion$$create
                        },
                        'TextConversionOption': {
                            'CHARACTER_BY_CHARACTER': 1,
                            'IGNORE_POST_POSITIONAL_WORD': 2,
                            'NONE': 0,
                            'USE_CHARACTER_VARIANTS': 2
                        },
                        'TextConversionType': {
                            'TO_HANGUL': 1,
                            'TO_HANJA': 2,
                            'TO_SCHINESE': 3,
                            'TO_TCHINESE': 4
                        },
                        'Transliteration': {
                            'create': instance.uno_Function_com$sun$star$i18n$Transliteration$$create
                        },
                        'TransliterationModulesExtra': {
                            'END_OF_MODULE': 0,
                            'IGNORE_DIACRITICS_CTL': 1073741824,
                            'IGNORE_KASHIDA_CTL': 2048,
                            'SENTENCE_CASE': 200,
                            'TITLE_CASE': 201,
                            'TOGGLE_CASE': 202
                        },
                        'TransliterationType': {
                            'CASCADE': 8,
                            'IGNORE': 4,
                            'NONE': 0,
                            'NUMERIC': 2,
                            'ONE_TO_ONE': 1,
                            'ONE_TO_ONE_NUMERIC': 3
                        },
                        'UnicodeType': {
                            'COMBINING_SPACING_MARK': 8,
                            'CONNECTOR_PUNCTUATION': 22,
                            'CONTROL': 15,
                            'CURRENCY_SYMBOL': 25,
                            'DASH_PUNCTUATION': 19,
                            'DECIMAL_DIGIT_NUMBER': 9,
                            'ENCLOSING_MARK': 7,
                            'END_PUNCTUATION': 29,
                            'FINAL_PUNCTUATION': 21,
                            'FORMAT': 16,
                            'GENERAL_TYPES_COUNT': 30,
                            'INITIAL_PUNCTUATION': 20,
                            'LETTER_NUMBER': 10,
                            'LINE_SEPARATOR': 13,
                            'LOWERCASE_LETTER': 2,
                            'MATH_SYMBOL': 24,
                            'MODIFIER_LETTER': 4,
                            'MODIFIER_SYMBOL': 26,
                            'NON_SPACING_MARK': 6,
                            'OTHER_LETTER': 5,
                            'OTHER_NUMBER': 11,
                            'OTHER_PUNCTUATION': 23,
                            'OTHER_SYMBOL': 27,
                            'PARAGRAPH_SEPARATOR': 14,
                            'PRIVATE_USE': 17,
                            'SPACE_SEPARATOR': 12,
                            'START_PUNCTUATION': 28,
                            'SURROGATE': 18,
                            'TITLECASE_LETTER': 3,
                            'UNASSIGNED': 0,
                            'UPPERCASE_LETTER': 1
                        },
                        'Weekdays': {
                            'FRIDAY': 5,
                            'MONDAY': 1,
                            'SATURDAY': 6,
                            'SUNDAY': 0,
                            'THURSDAY': 4,
                            'TUESDAY': 2,
                            'WEDNESDAY': 3
                        },
                        'WordType': {
                            'ANYWORD_IGNOREWHITESPACES': 1,
                            'ANY_WORD': 0,
                            'DICTIONARY_WORD': 2,
                            'WORD_COUNT': 3
                        },
                        'reservedWords': {
                            'ABOVE_WORD': 6,
                            'BELOW_WORD': 7,
                            'COUNT': 12,
                            'FALSE_WORD': 1,
                            'QUARTER1_ABBREVIATION': 8,
                            'QUARTER1_WORD': 2,
                            'QUARTER2_ABBREVIATION': 9,
                            'QUARTER2_WORD': 3,
                            'QUARTER3_ABBREVIATION': 10,
                            'QUARTER3_WORD': 4,
                            'QUARTER4_ABBREVIATION': 11,
                            'QUARTER4_WORD': 5,
                            'TRUE_WORD': 0
                        }
                    },
                    'image': {
                    },
                    'inspection': {
                        'InteractiveSelectionResult': instance.uno_Type_com$sun$star$inspection$InteractiveSelectionResult,
                        'LineDescriptor': instance.uno_Type_com$sun$star$inspection$LineDescriptor,
                        'PropertyCategoryDescriptor': instance.uno_Type_com$sun$star$inspection$PropertyCategoryDescriptor,
                        'XHyperlinkControl': instance.uno_Type_com$sun$star$inspection$XHyperlinkControl,
                        'XNumericControl': instance.uno_Type_com$sun$star$inspection$XNumericControl,
                        'XObjectInspector': instance.uno_Type_com$sun$star$inspection$XObjectInspector,
                        'XObjectInspectorModel': instance.uno_Type_com$sun$star$inspection$XObjectInspectorModel,
                        'XObjectInspectorUI': instance.uno_Type_com$sun$star$inspection$XObjectInspectorUI,
                        'XPropertyControl': instance.uno_Type_com$sun$star$inspection$XPropertyControl,
                        'XPropertyControlContext': instance.uno_Type_com$sun$star$inspection$XPropertyControlContext,
                        'XPropertyControlFactory': instance.uno_Type_com$sun$star$inspection$XPropertyControlFactory,
                        'XPropertyControlObserver': instance.uno_Type_com$sun$star$inspection$XPropertyControlObserver,
                        'XPropertyHandler': instance.uno_Type_com$sun$star$inspection$XPropertyHandler,
                        'XStringListControl': instance.uno_Type_com$sun$star$inspection$XStringListControl,
                        'XStringRepresentation': instance.uno_Type_com$sun$star$inspection$XStringRepresentation,
                        'DefaultHelpProvider': {
                            'create': instance.uno_Function_com$sun$star$inspection$DefaultHelpProvider$$create
                        },
                        'GenericPropertyHandler': {
                            'create': instance.uno_Function_com$sun$star$inspection$GenericPropertyHandler$$create
                        },
                        'ObjectInspector': {
                            'createDefault': instance.uno_Function_com$sun$star$inspection$ObjectInspector$$createDefault,
                            'createWithModel': instance.uno_Function_com$sun$star$inspection$ObjectInspector$$createWithModel
                        },
                        'ObjectInspectorModel': {
                            'createDefault': instance.uno_Function_com$sun$star$inspection$ObjectInspectorModel$$createDefault,
                            'createWithHandlerFactories': instance.uno_Function_com$sun$star$inspection$ObjectInspectorModel$$createWithHandlerFactories,
                            'createWithHandlerFactoriesAndHelpSection': instance.uno_Function_com$sun$star$inspection$ObjectInspectorModel$$createWithHandlerFactoriesAndHelpSection
                        },
                        'PropertyControlType': {
                            'CharacterField': 5,
                            'ColorListBox': 7,
                            'ComboBox': 2,
                            'DateField': 9,
                            'DateTimeField': 11,
                            'HyperlinkField': 12,
                            'ListBox': 1,
                            'MultiLineTextField': 4,
                            'NumericField': 8,
                            'StringListField': 6,
                            'TextField': 3,
                            'TimeField': 10,
                            'Unknown': 13
                        },
                        'PropertyLineElement': {
                            'All': 255,
                            'InputControl': 1,
                            'PrimaryButton': 2,
                            'SecondaryButton': 4
                        },
                        'StringRepresentation': {
                            'create': instance.uno_Function_com$sun$star$inspection$StringRepresentation$$create,
                            'createConstant': instance.uno_Function_com$sun$star$inspection$StringRepresentation$$createConstant
                        }
                    },
                    'io': {
                        'AlreadyConnectedException': instance.uno_Type_com$sun$star$io$AlreadyConnectedException,
                        'BufferSizeExceededException': instance.uno_Type_com$sun$star$io$BufferSizeExceededException,
                        'ConnectException': instance.uno_Type_com$sun$star$io$ConnectException,
                        'DataTransferEvent': instance.uno_Type_com$sun$star$io$DataTransferEvent,
                        'FilePermission': instance.uno_Type_com$sun$star$io$FilePermission,
                        'IOException': instance.uno_Type_com$sun$star$io$IOException,
                        'NoRouteToHostException': instance.uno_Type_com$sun$star$io$NoRouteToHostException,
                        'NotConnectedException': instance.uno_Type_com$sun$star$io$NotConnectedException,
                        'SocketException': instance.uno_Type_com$sun$star$io$SocketException,
                        'UnexpectedEOFException': instance.uno_Type_com$sun$star$io$UnexpectedEOFException,
                        'UnknownHostException': instance.uno_Type_com$sun$star$io$UnknownHostException,
                        'WrongFormatException': instance.uno_Type_com$sun$star$io$WrongFormatException,
                        'XActiveDataControl': instance.uno_Type_com$sun$star$io$XActiveDataControl,
                        'XActiveDataSink': instance.uno_Type_com$sun$star$io$XActiveDataSink,
                        'XActiveDataSource': instance.uno_Type_com$sun$star$io$XActiveDataSource,
                        'XActiveDataStreamer': instance.uno_Type_com$sun$star$io$XActiveDataStreamer,
                        'XAsyncOutputMonitor': instance.uno_Type_com$sun$star$io$XAsyncOutputMonitor,
                        'XConnectable': instance.uno_Type_com$sun$star$io$XConnectable,
                        'XDataExporter': instance.uno_Type_com$sun$star$io$XDataExporter,
                        'XDataImporter': instance.uno_Type_com$sun$star$io$XDataImporter,
                        'XDataInputStream': instance.uno_Type_com$sun$star$io$XDataInputStream,
                        'XDataOutputStream': instance.uno_Type_com$sun$star$io$XDataOutputStream,
                        'XDataTransferEventListener': instance.uno_Type_com$sun$star$io$XDataTransferEventListener,
                        'XInputStream': instance.uno_Type_com$sun$star$io$XInputStream,
                        'XInputStreamProvider': instance.uno_Type_com$sun$star$io$XInputStreamProvider,
                        'XMarkableStream': instance.uno_Type_com$sun$star$io$XMarkableStream,
                        'XObjectInputStream': instance.uno_Type_com$sun$star$io$XObjectInputStream,
                        'XObjectOutputStream': instance.uno_Type_com$sun$star$io$XObjectOutputStream,
                        'XOutputStream': instance.uno_Type_com$sun$star$io$XOutputStream,
                        'XPersist': instance.uno_Type_com$sun$star$io$XPersist,
                        'XPersistObject': instance.uno_Type_com$sun$star$io$XPersistObject,
                        'XPipe': instance.uno_Type_com$sun$star$io$XPipe,
                        'XSeekable': instance.uno_Type_com$sun$star$io$XSeekable,
                        'XSeekableInputStream': instance.uno_Type_com$sun$star$io$XSeekableInputStream,
                        'XSequenceOutputStream': instance.uno_Type_com$sun$star$io$XSequenceOutputStream,
                        'XStream': instance.uno_Type_com$sun$star$io$XStream,
                        'XStreamListener': instance.uno_Type_com$sun$star$io$XStreamListener,
                        'XTempFile': instance.uno_Type_com$sun$star$io$XTempFile,
                        'XTextInputStream': instance.uno_Type_com$sun$star$io$XTextInputStream,
                        'XTextInputStream2': instance.uno_Type_com$sun$star$io$XTextInputStream2,
                        'XTextOutputStream': instance.uno_Type_com$sun$star$io$XTextOutputStream,
                        'XTextOutputStream2': instance.uno_Type_com$sun$star$io$XTextOutputStream2,
                        'XTruncate': instance.uno_Type_com$sun$star$io$XTruncate,
                        'XXMLExtractor': instance.uno_Type_com$sun$star$io$XXMLExtractor,
                        'Pipe': {
                            'create': instance.uno_Function_com$sun$star$io$Pipe$$create
                        },
                        'SequenceInputStream': {
                            'createStreamFromSequence': instance.uno_Function_com$sun$star$io$SequenceInputStream$$createStreamFromSequence
                        },
                        'SequenceOutputStream': {
                            'create': instance.uno_Function_com$sun$star$io$SequenceOutputStream$$create
                        },
                        'TempFile': {
                            'create': instance.uno_Function_com$sun$star$io$TempFile$$create
                        },
                        'TextInputStream': {
                            'create': instance.uno_Function_com$sun$star$io$TextInputStream$$create
                        },
                        'TextOutputStream': {
                            'create': instance.uno_Function_com$sun$star$io$TextOutputStream$$create
                        }
                    },
                    'java': {
                        'InvalidJavaSettingsException': instance.uno_Type_com$sun$star$java$InvalidJavaSettingsException,
                        'JavaDisabledException': instance.uno_Type_com$sun$star$java$JavaDisabledException,
                        'JavaInitializationException': instance.uno_Type_com$sun$star$java$JavaInitializationException,
                        'JavaNotConfiguredException': instance.uno_Type_com$sun$star$java$JavaNotConfiguredException,
                        'JavaNotFoundException': instance.uno_Type_com$sun$star$java$JavaNotFoundException,
                        'JavaVMCreationFailureException': instance.uno_Type_com$sun$star$java$JavaVMCreationFailureException,
                        'MissingJavaRuntimeException': instance.uno_Type_com$sun$star$java$MissingJavaRuntimeException,
                        'RestartRequiredException': instance.uno_Type_com$sun$star$java$RestartRequiredException,
                        'WrongJavaVersionException': instance.uno_Type_com$sun$star$java$WrongJavaVersionException,
                        'XJavaThreadRegister_11': instance.uno_Type_com$sun$star$java$XJavaThreadRegister_11,
                        'XJavaVM': instance.uno_Type_com$sun$star$java$XJavaVM,
                        'JavaVirtualMachine': {
                            'create': instance.uno_Function_com$sun$star$java$JavaVirtualMachine$$create
                        }
                    },
                    'lang': {
                        'ArrayIndexOutOfBoundsException': instance.uno_Type_com$sun$star$lang$ArrayIndexOutOfBoundsException,
                        'ClassNotFoundException': instance.uno_Type_com$sun$star$lang$ClassNotFoundException,
                        'DisposedException': instance.uno_Type_com$sun$star$lang$DisposedException,
                        'EventObject': instance.uno_Type_com$sun$star$lang$EventObject,
                        'IllegalAccessException': instance.uno_Type_com$sun$star$lang$IllegalAccessException,
                        'IllegalArgumentException': instance.uno_Type_com$sun$star$lang$IllegalArgumentException,
                        'IndexOutOfBoundsException': instance.uno_Type_com$sun$star$lang$IndexOutOfBoundsException,
                        'InvalidListenerException': instance.uno_Type_com$sun$star$lang$InvalidListenerException,
                        'ListenerExistException': instance.uno_Type_com$sun$star$lang$ListenerExistException,
                        'Locale': instance.uno_Type_com$sun$star$lang$Locale,
                        'NoSuchFieldException': instance.uno_Type_com$sun$star$lang$NoSuchFieldException,
                        'NoSuchMethodException': instance.uno_Type_com$sun$star$lang$NoSuchMethodException,
                        'NoSupportException': instance.uno_Type_com$sun$star$lang$NoSupportException,
                        'NotInitializedException': instance.uno_Type_com$sun$star$lang$NotInitializedException,
                        'NullPointerException': instance.uno_Type_com$sun$star$lang$NullPointerException,
                        'ServiceNotRegisteredException': instance.uno_Type_com$sun$star$lang$ServiceNotRegisteredException,
                        'WrappedTargetException': instance.uno_Type_com$sun$star$lang$WrappedTargetException,
                        'WrappedTargetRuntimeException': instance.uno_Type_com$sun$star$lang$WrappedTargetRuntimeException,
                        'XComponent': instance.uno_Type_com$sun$star$lang$XComponent,
                        'XConnectionPoint': instance.uno_Type_com$sun$star$lang$XConnectionPoint,
                        'XConnectionPointContainer': instance.uno_Type_com$sun$star$lang$XConnectionPointContainer,
                        'XEventListener': instance.uno_Type_com$sun$star$lang$XEventListener,
                        'XInitialization': instance.uno_Type_com$sun$star$lang$XInitialization,
                        'XLocalizable': instance.uno_Type_com$sun$star$lang$XLocalizable,
                        'XMain': instance.uno_Type_com$sun$star$lang$XMain,
                        'XMultiComponentFactory': instance.uno_Type_com$sun$star$lang$XMultiComponentFactory,
                        'XMultiServiceFactory': instance.uno_Type_com$sun$star$lang$XMultiServiceFactory,
                        'XServiceDisplayName': instance.uno_Type_com$sun$star$lang$XServiceDisplayName,
                        'XServiceInfo': instance.uno_Type_com$sun$star$lang$XServiceInfo,
                        'XServiceName': instance.uno_Type_com$sun$star$lang$XServiceName,
                        'XSingleComponentFactory': instance.uno_Type_com$sun$star$lang$XSingleComponentFactory,
                        'XSingleServiceFactory': instance.uno_Type_com$sun$star$lang$XSingleServiceFactory,
                        'XTypeProvider': instance.uno_Type_com$sun$star$lang$XTypeProvider,
                        'XUnoTunnel': instance.uno_Type_com$sun$star$lang$XUnoTunnel,
                        'SystemDependent': {
                            'SYSTEM_ANDROID': 8,
                            'SYSTEM_IOS': 7,
                            'SYSTEM_JAVA': 3,
                            'SYSTEM_MAC': 5,
                            'SYSTEM_OS2': 4,
                            'SYSTEM_WIN16': 2,
                            'SYSTEM_WIN32': 1,
                            'SYSTEM_XWINDOW': 6
                        }
                    },
                    'ldap': {
                        'LdapConnectionException': instance.uno_Type_com$sun$star$ldap$LdapConnectionException,
                        'LdapGenericException': instance.uno_Type_com$sun$star$ldap$LdapGenericException
                    },
                    'linguistic2': {
                        'ConversionDirection': instance.uno_Type_com$sun$star$linguistic2$ConversionDirection,
                        'DictionaryEvent': instance.uno_Type_com$sun$star$linguistic2$DictionaryEvent,
                        'DictionaryListEvent': instance.uno_Type_com$sun$star$linguistic2$DictionaryListEvent,
                        'DictionaryType': instance.uno_Type_com$sun$star$linguistic2$DictionaryType,
                        'LinguServiceEvent': instance.uno_Type_com$sun$star$linguistic2$LinguServiceEvent,
                        'ProofreadingResult': instance.uno_Type_com$sun$star$linguistic2$ProofreadingResult,
                        'SingleProofreadingError': instance.uno_Type_com$sun$star$linguistic2$SingleProofreadingError,
                        'XAvailableLocales': instance.uno_Type_com$sun$star$linguistic2$XAvailableLocales,
                        'XConversionDictionary': instance.uno_Type_com$sun$star$linguistic2$XConversionDictionary,
                        'XConversionDictionaryList': instance.uno_Type_com$sun$star$linguistic2$XConversionDictionaryList,
                        'XConversionPropertyType': instance.uno_Type_com$sun$star$linguistic2$XConversionPropertyType,
                        'XDictionary': instance.uno_Type_com$sun$star$linguistic2$XDictionary,
                        'XDictionary1': instance.uno_Type_com$sun$star$linguistic2$XDictionary1,
                        'XDictionaryEntry': instance.uno_Type_com$sun$star$linguistic2$XDictionaryEntry,
                        'XDictionaryEventListener': instance.uno_Type_com$sun$star$linguistic2$XDictionaryEventListener,
                        'XDictionaryList': instance.uno_Type_com$sun$star$linguistic2$XDictionaryList,
                        'XDictionaryListEventListener': instance.uno_Type_com$sun$star$linguistic2$XDictionaryListEventListener,
                        'XHyphenatedWord': instance.uno_Type_com$sun$star$linguistic2$XHyphenatedWord,
                        'XHyphenator': instance.uno_Type_com$sun$star$linguistic2$XHyphenator,
                        'XLanguageGuessing': instance.uno_Type_com$sun$star$linguistic2$XLanguageGuessing,
                        'XLinguProperties': instance.uno_Type_com$sun$star$linguistic2$XLinguProperties,
                        'XLinguServiceEventBroadcaster': instance.uno_Type_com$sun$star$linguistic2$XLinguServiceEventBroadcaster,
                        'XLinguServiceEventListener': instance.uno_Type_com$sun$star$linguistic2$XLinguServiceEventListener,
                        'XLinguServiceManager': instance.uno_Type_com$sun$star$linguistic2$XLinguServiceManager,
                        'XLinguServiceManager2': instance.uno_Type_com$sun$star$linguistic2$XLinguServiceManager2,
                        'XMeaning': instance.uno_Type_com$sun$star$linguistic2$XMeaning,
                        'XNumberText': instance.uno_Type_com$sun$star$linguistic2$XNumberText,
                        'XPossibleHyphens': instance.uno_Type_com$sun$star$linguistic2$XPossibleHyphens,
                        'XProofreader': instance.uno_Type_com$sun$star$linguistic2$XProofreader,
                        'XProofreadingIterator': instance.uno_Type_com$sun$star$linguistic2$XProofreadingIterator,
                        'XSearchableDictionary': instance.uno_Type_com$sun$star$linguistic2$XSearchableDictionary,
                        'XSearchableDictionaryList': instance.uno_Type_com$sun$star$linguistic2$XSearchableDictionaryList,
                        'XSetSpellAlternatives': instance.uno_Type_com$sun$star$linguistic2$XSetSpellAlternatives,
                        'XSpellAlternatives': instance.uno_Type_com$sun$star$linguistic2$XSpellAlternatives,
                        'XSpellChecker': instance.uno_Type_com$sun$star$linguistic2$XSpellChecker,
                        'XSpellChecker1': instance.uno_Type_com$sun$star$linguistic2$XSpellChecker1,
                        'XSupportedLanguages': instance.uno_Type_com$sun$star$linguistic2$XSupportedLanguages,
                        'XSupportedLocales': instance.uno_Type_com$sun$star$linguistic2$XSupportedLocales,
                        'XThesaurus': instance.uno_Type_com$sun$star$linguistic2$XThesaurus,
                        'ConversionDictionaryList': {
                            'create': instance.uno_Function_com$sun$star$linguistic2$ConversionDictionaryList$$create
                        },
                        'ConversionDictionaryType': {
                            'HANGUL_HANJA': 1,
                            'SCHINESE_TCHINESE': 2
                        },
                        'ConversionPropertyType': {
                            'ABBREVIATION': 11,
                            'ADJECTIVE': 9,
                            'BRAND_NAME': 15,
                            'BUSINESS': 8,
                            'FIRST_NAME': 3,
                            'FOREIGN': 2,
                            'IDIOM': 10,
                            'LAST_NAME': 4,
                            'NOT_DEFINED': 0,
                            'NOUN': 13,
                            'NUMERICAL': 12,
                            'OTHER': 1,
                            'PLACE_NAME': 7,
                            'STATUS': 6,
                            'TITLE': 5,
                            'VERB': 14
                        },
                        'DictionaryEventFlags': {
                            'ACTIVATE_DIC': 32,
                            'ADD_ENTRY': 1,
                            'CHG_LANGUAGE': 8,
                            'CHG_NAME': 4,
                            'DEACTIVATE_DIC': 64,
                            'DEL_ENTRY': 2,
                            'ENTRIES_CLEARED': 16
                        },
                        'DictionaryList': {
                            'create': instance.uno_Function_com$sun$star$linguistic2$DictionaryList$$create
                        },
                        'DictionaryListEventFlags': {
                            'ACTIVATE_NEG_DIC': 64,
                            'ACTIVATE_POS_DIC': 16,
                            'ADD_NEG_ENTRY': 4,
                            'ADD_POS_ENTRY': 1,
                            'DEACTIVATE_NEG_DIC': 128,
                            'DEACTIVATE_POS_DIC': 32,
                            'DEL_NEG_ENTRY': 8,
                            'DEL_POS_ENTRY': 2
                        },
                        'LanguageGuessing': {
                            'create': instance.uno_Function_com$sun$star$linguistic2$LanguageGuessing$$create
                        },
                        'LinguProperties': {
                            'create': instance.uno_Function_com$sun$star$linguistic2$LinguProperties$$create
                        },
                        'LinguServiceEventFlags': {
                            'HYPHENATE_AGAIN': 4,
                            'PROOFREAD_AGAIN': 8,
                            'SPELL_CORRECT_WORDS_AGAIN': 1,
                            'SPELL_WRONG_WORDS_AGAIN': 2
                        },
                        'LinguServiceManager': {
                            'create': instance.uno_Function_com$sun$star$linguistic2$LinguServiceManager$$create
                        },
                        'NumberText': {
                            'create': instance.uno_Function_com$sun$star$linguistic2$NumberText$$create
                        },
                        'ProofreadingIterator': {
                            'create': instance.uno_Function_com$sun$star$linguistic2$ProofreadingIterator$$create
                        },
                        'SpellFailure': {
                            'CAPTION_ERROR': 3,
                            'IS_NEGATIVE_WORD': 2,
                            'SPELLING_ERROR': 4
                        }
                    },
                    'loader': {
                        'CannotActivateFactoryException': instance.uno_Type_com$sun$star$loader$CannotActivateFactoryException,
                        'XImplementationLoader': instance.uno_Type_com$sun$star$loader$XImplementationLoader,
                        'Dynamic': {
                            'create': instance.uno_Function_com$sun$star$loader$Dynamic$$create
                        },
                        'Java': {
                            'create': instance.uno_Function_com$sun$star$loader$Java$$create
                        },
                        'SharedLibrary': {
                            'create': instance.uno_Function_com$sun$star$loader$SharedLibrary$$create
                        }
                    },
                    'logging': {
                        'LogRecord': instance.uno_Type_com$sun$star$logging$LogRecord,
                        'LoggerPool': instance.uno_Function_com$sun$star$logging$LoggerPool,
                        'XConsoleHandler': instance.uno_Type_com$sun$star$logging$XConsoleHandler,
                        'XCsvLogFormatter': instance.uno_Type_com$sun$star$logging$XCsvLogFormatter,
                        'XLogFormatter': instance.uno_Type_com$sun$star$logging$XLogFormatter,
                        'XLogHandler': instance.uno_Type_com$sun$star$logging$XLogHandler,
                        'XLogger': instance.uno_Type_com$sun$star$logging$XLogger,
                        'XLoggerPool': instance.uno_Type_com$sun$star$logging$XLoggerPool,
                        'ConsoleHandler': {
                            'create': instance.uno_Function_com$sun$star$logging$ConsoleHandler$$create,
                            'createWithSettings': instance.uno_Function_com$sun$star$logging$ConsoleHandler$$createWithSettings
                        },
                        'CsvLogFormatter': {
                            'create': instance.uno_Function_com$sun$star$logging$CsvLogFormatter$$create
                        },
                        'FileHandler': {
                            'create': instance.uno_Function_com$sun$star$logging$FileHandler$$create,
                            'createWithSettings': instance.uno_Function_com$sun$star$logging$FileHandler$$createWithSettings
                        },
                        'LogLevel': {
                            'ALL': -2147483648,
                            'CONFIG': 700,
                            'FINE': 500,
                            'FINER': 400,
                            'FINEST': 300,
                            'INFO': 800,
                            'OFF': 2147483647,
                            'SEVERE': 1000,
                            'WARNING': 900
                        },
                        'PlainTextFormatter': {
                            'create': instance.uno_Function_com$sun$star$logging$PlainTextFormatter$$create
                        },
                        'SimpleTextFormatter': {
                            'create': instance.uno_Function_com$sun$star$logging$SimpleTextFormatter$$create
                        }
                    },
                    'mail': {
                        'MailAttachment': instance.uno_Type_com$sun$star$mail$MailAttachment,
                        'MailException': instance.uno_Type_com$sun$star$mail$MailException,
                        'MailServiceType': instance.uno_Type_com$sun$star$mail$MailServiceType,
                        'NoMailServiceProviderException': instance.uno_Type_com$sun$star$mail$NoMailServiceProviderException,
                        'NoMailTransportProviderException': instance.uno_Type_com$sun$star$mail$NoMailTransportProviderException,
                        'SendMailMessageFailedException': instance.uno_Type_com$sun$star$mail$SendMailMessageFailedException,
                        'XAuthenticator': instance.uno_Type_com$sun$star$mail$XAuthenticator,
                        'XConnectionListener': instance.uno_Type_com$sun$star$mail$XConnectionListener,
                        'XMailMessage': instance.uno_Type_com$sun$star$mail$XMailMessage,
                        'XMailService': instance.uno_Type_com$sun$star$mail$XMailService,
                        'XMailServiceProvider': instance.uno_Type_com$sun$star$mail$XMailServiceProvider,
                        'XSmtpService': instance.uno_Type_com$sun$star$mail$XSmtpService,
                        'MailMessage': {
                            'create': instance.uno_Function_com$sun$star$mail$MailMessage$$create,
                            'createWithAttachment': instance.uno_Function_com$sun$star$mail$MailMessage$$createWithAttachment
                        },
                        'MailServiceProvider': {
                            'create': instance.uno_Function_com$sun$star$mail$MailServiceProvider$$create
                        }
                    },
                    'media': {
                        'XFrameGrabber': instance.uno_Type_com$sun$star$media$XFrameGrabber,
                        'XManager': instance.uno_Type_com$sun$star$media$XManager,
                        'XPlayer': instance.uno_Type_com$sun$star$media$XPlayer,
                        'XPlayerListener': instance.uno_Type_com$sun$star$media$XPlayerListener,
                        'XPlayerNotifier': instance.uno_Type_com$sun$star$media$XPlayerNotifier,
                        'XPlayerWindow': instance.uno_Type_com$sun$star$media$XPlayerWindow,
                        'ZoomLevel': instance.uno_Type_com$sun$star$media$ZoomLevel,
                        'Manager': {
                            'create': instance.uno_Function_com$sun$star$media$Manager$$create
                        }
                    },
                    'mozilla': {
                        'MenuMultipleChange': instance.uno_Type_com$sun$star$mozilla$MenuMultipleChange,
                        'MenuSingleChange': instance.uno_Type_com$sun$star$mozilla$MenuSingleChange,
                        'MozillaProductType': instance.uno_Type_com$sun$star$mozilla$MozillaProductType,
                        'XCloseSessionListener': instance.uno_Type_com$sun$star$mozilla$XCloseSessionListener,
                        'XCodeProxy': instance.uno_Type_com$sun$star$mozilla$XCodeProxy,
                        'XMenuProxy': instance.uno_Type_com$sun$star$mozilla$XMenuProxy,
                        'XMenuProxyListener': instance.uno_Type_com$sun$star$mozilla$XMenuProxyListener,
                        'XMozillaBootstrap': instance.uno_Type_com$sun$star$mozilla$XMozillaBootstrap,
                        'XProfileDiscover': instance.uno_Type_com$sun$star$mozilla$XProfileDiscover,
                        'XProfileManager': instance.uno_Type_com$sun$star$mozilla$XProfileManager,
                        'XProxyRunner': instance.uno_Type_com$sun$star$mozilla$XProxyRunner,
                        'MozillaBootstrap': {
                            'create': instance.uno_Function_com$sun$star$mozilla$MozillaBootstrap$$create
                        }
                    },
                    'office': {
                        'XAnnotation': instance.uno_Type_com$sun$star$office$XAnnotation,
                        'XAnnotationAccess': instance.uno_Type_com$sun$star$office$XAnnotationAccess,
                        'XAnnotationEnumeration': instance.uno_Type_com$sun$star$office$XAnnotationEnumeration,
                        'Quickstart': {
                            'createDefault': instance.uno_Function_com$sun$star$office$Quickstart$$createDefault,
                            'createAndSetVeto': instance.uno_Function_com$sun$star$office$Quickstart$$createAndSetVeto,
                            'createStart': instance.uno_Function_com$sun$star$office$Quickstart$$createStart,
                            'createAutoStart': instance.uno_Function_com$sun$star$office$Quickstart$$createAutoStart
                        }
                    },
                    'packages': {
                        'EncryptionNotAllowedException': instance.uno_Type_com$sun$star$packages$EncryptionNotAllowedException,
                        'NoEncryptionException': instance.uno_Type_com$sun$star$packages$NoEncryptionException,
                        'NoRawFormatException': instance.uno_Type_com$sun$star$packages$NoRawFormatException,
                        'WrongPasswordException': instance.uno_Type_com$sun$star$packages$WrongPasswordException,
                        'XDataSinkEncrSupport': instance.uno_Type_com$sun$star$packages$XDataSinkEncrSupport,
                        'XPackageEncryption': instance.uno_Type_com$sun$star$packages$XPackageEncryption,
                        'PackageEncryption': {
                            'create': instance.uno_Function_com$sun$star$packages$PackageEncryption$$create
                        },
                        'manifest': {
                            'XManifestReader': instance.uno_Type_com$sun$star$packages$manifest$XManifestReader,
                            'XManifestWriter': instance.uno_Type_com$sun$star$packages$manifest$XManifestWriter,
                            'ManifestReader': {
                                'create': instance.uno_Function_com$sun$star$packages$manifest$ManifestReader$$create
                            },
                            'ManifestWriter': {
                                'create': instance.uno_Function_com$sun$star$packages$manifest$ManifestWriter$$create
                            }
                        },
                        'zip': {
                            'XZipFileAccess': instance.uno_Type_com$sun$star$packages$zip$XZipFileAccess,
                            'XZipFileAccess2': instance.uno_Type_com$sun$star$packages$zip$XZipFileAccess2,
                            'ZipEntry': instance.uno_Type_com$sun$star$packages$zip$ZipEntry,
                            'ZipException': instance.uno_Type_com$sun$star$packages$zip$ZipException,
                            'ZipIOException': instance.uno_Type_com$sun$star$packages$zip$ZipIOException,
                            'ZipConstants': {
                                'BEST_COMPRESSION': 9,
                                'BEST_SPEED': 1,
                                'CENATT': 36,
                                'CENATX': 38,
                                'CENCOM': 32,
                                'CENCRC': 16,
                                'CENDAT': 14,
                                'CENDSK': 34,
                                'CENEXT': 30,
                                'CENFLG': 8,
                                'CENHDR': 46,
                                'CENHOW': 10,
                                'CENLEN': 24,
                                'CENNAM': 28,
                                'CENOFF': 42,
                                'CENSIG': 33639248,
                                'CENSIZ': 20,
                                'CENTIM': 12,
                                'CENVEM': 4,
                                'CENVER': 6,
                                'DEFAULT_COMPRESSION': -1,
                                'DEFAULT_STRATEGY': 0,
                                'DEFLATED': 8,
                                'DEF_MEM_LEVEL': 8,
                                'ENDCOM': 20,
                                'ENDHDR': 22,
                                'ENDOFF': 16,
                                'ENDSIG': 101010256,
                                'ENDSIZ': 12,
                                'ENDSUB': 8,
                                'ENDTOT': 10,
                                'EXTCRC': 4,
                                'EXTHDR': 16,
                                'EXTLEN': 12,
                                'EXTSIG': 134695760,
                                'EXTSIZ': 8,
                                'FILTERED': 1,
                                'HUFFMAN_ONLY': 2,
                                'LOCCRC': 14,
                                'LOCEXT': 28,
                                'LOCFLG': 6,
                                'LOCHDR': 30,
                                'LOCHOW': 8,
                                'LOCLEN': 22,
                                'LOCNAM': 26,
                                'LOCSIG': 67324752,
                                'LOCSIZ': 18,
                                'LOCTIM': 10,
                                'LOCVER': 4,
                                'NO_COMPRESSION': 0,
                                'SPANSIG': 134695760,
                                'STORED': 0
                            },
                            'ZipFileAccess': {
                                'createWithURL': instance.uno_Function_com$sun$star$packages$zip$ZipFileAccess$$createWithURL
                            }
                        }
                    },
                    'presentation': {
                        'AnimationEffect': instance.uno_Type_com$sun$star$presentation$AnimationEffect,
                        'AnimationSpeed': instance.uno_Type_com$sun$star$presentation$AnimationSpeed,
                        'ClickAction': instance.uno_Type_com$sun$star$presentation$ClickAction,
                        'FadeEffect': instance.uno_Type_com$sun$star$presentation$FadeEffect,
                        'ParagraphTarget': instance.uno_Type_com$sun$star$presentation$ParagraphTarget,
                        'PresentationRange': instance.uno_Type_com$sun$star$presentation$PresentationRange,
                        'XCustomPresentationSupplier': instance.uno_Type_com$sun$star$presentation$XCustomPresentationSupplier,
                        'XHandoutMasterSupplier': instance.uno_Type_com$sun$star$presentation$XHandoutMasterSupplier,
                        'XPresentation': instance.uno_Type_com$sun$star$presentation$XPresentation,
                        'XPresentation2': instance.uno_Type_com$sun$star$presentation$XPresentation2,
                        'XPresentationPage': instance.uno_Type_com$sun$star$presentation$XPresentationPage,
                        'XPresentationSupplier': instance.uno_Type_com$sun$star$presentation$XPresentationSupplier,
                        'XShapeEventListener': instance.uno_Type_com$sun$star$presentation$XShapeEventListener,
                        'XSlideShow': instance.uno_Type_com$sun$star$presentation$XSlideShow,
                        'XSlideShowController': instance.uno_Type_com$sun$star$presentation$XSlideShowController,
                        'XSlideShowListener': instance.uno_Type_com$sun$star$presentation$XSlideShowListener,
                        'XSlideShowNavigationListener': instance.uno_Type_com$sun$star$presentation$XSlideShowNavigationListener,
                        'XSlideShowView': instance.uno_Type_com$sun$star$presentation$XSlideShowView,
                        'XTransition': instance.uno_Type_com$sun$star$presentation$XTransition,
                        'XTransitionFactory': instance.uno_Type_com$sun$star$presentation$XTransitionFactory,
                        'CreateDialogFactoryService': {
                            'create': instance.uno_Function_com$sun$star$presentation$CreateDialogFactoryService$$create
                        },
                        'EffectCommands': {
                            'CUSTOM': 0,
                            'PLAY': 2,
                            'STOP': 4,
                            'STOPAUDIO': 5,
                            'TOGGLEPAUSE': 3,
                            'VERB': 1
                        },
                        'EffectNodeType': {
                            'AFTER_PREVIOUS': 3,
                            'DEFAULT': 0,
                            'INTERACTIVE_SEQUENCE': 6,
                            'MAIN_SEQUENCE': 4,
                            'ON_CLICK': 1,
                            'TIMING_ROOT': 5,
                            'WITH_PREVIOUS': 2
                        },
                        'EffectPresetClass': {
                            'CUSTOM': 0,
                            'EMPHASIS': 3,
                            'ENTRANCE': 1,
                            'EXIT': 2,
                            'MEDIACALL': 6,
                            'MOTIONPATH': 4,
                            'OLEACTION': 5
                        },
                        'ShapeAnimationSubType': {
                            'AS_WHOLE': 0,
                            'ONLY_BACKGROUND': 1,
                            'ONLY_TEXT': 2
                        },
                        'SlideShow': {
                            'create': instance.uno_Function_com$sun$star$presentation$SlideShow$$create
                        },
                        'TextAnimationType': {
                            'BY_LETTER': 2,
                            'BY_PARAGRAPH': 0,
                            'BY_WORD': 1
                        },
                        'TransitionFactory': {
                            'create': instance.uno_Function_com$sun$star$presentation$TransitionFactory$$create
                        },
                        'textfield': {
                        }
                    },
                    'qa': {
                        'XDumper': instance.uno_Type_com$sun$star$qa$XDumper
                    },
                    'rdf': {
                        'ParseException': instance.uno_Type_com$sun$star$rdf$ParseException,
                        'QueryException': instance.uno_Type_com$sun$star$rdf$QueryException,
                        'RepositoryException': instance.uno_Type_com$sun$star$rdf$RepositoryException,
                        'Statement': instance.uno_Type_com$sun$star$rdf$Statement,
                        'XBlankNode': instance.uno_Type_com$sun$star$rdf$XBlankNode,
                        'XDocumentMetadataAccess': instance.uno_Type_com$sun$star$rdf$XDocumentMetadataAccess,
                        'XDocumentRepository': instance.uno_Type_com$sun$star$rdf$XDocumentRepository,
                        'XLiteral': instance.uno_Type_com$sun$star$rdf$XLiteral,
                        'XMetadatable': instance.uno_Type_com$sun$star$rdf$XMetadatable,
                        'XNamedGraph': instance.uno_Type_com$sun$star$rdf$XNamedGraph,
                        'XNode': instance.uno_Type_com$sun$star$rdf$XNode,
                        'XQuerySelectResult': instance.uno_Type_com$sun$star$rdf$XQuerySelectResult,
                        'XReifiedStatement': instance.uno_Type_com$sun$star$rdf$XReifiedStatement,
                        'XRepository': instance.uno_Type_com$sun$star$rdf$XRepository,
                        'XRepositorySupplier': instance.uno_Type_com$sun$star$rdf$XRepositorySupplier,
                        'XResource': instance.uno_Type_com$sun$star$rdf$XResource,
                        'XURI': instance.uno_Type_com$sun$star$rdf$XURI,
                        'BlankNode': {
                            'create': instance.uno_Function_com$sun$star$rdf$BlankNode$$create
                        },
                        'FileFormat': {
                            'N3': 1,
                            'NTRIPLES': 2,
                            'RDF_XML': 0,
                            'TRIG': 3,
                            'TRIX': 4,
                            'TURTLE': 5
                        },
                        'Literal': {
                            'create': instance.uno_Function_com$sun$star$rdf$Literal$$create,
                            'createWithType': instance.uno_Function_com$sun$star$rdf$Literal$$createWithType,
                            'createWithLanguage': instance.uno_Function_com$sun$star$rdf$Literal$$createWithLanguage
                        },
                        'Repository': {
                            'create': instance.uno_Function_com$sun$star$rdf$Repository$$create
                        },
                        'URI': {
                            'create': instance.uno_Function_com$sun$star$rdf$URI$$create,
                            'createNS': instance.uno_Function_com$sun$star$rdf$URI$$createNS,
                            'createKnown': instance.uno_Function_com$sun$star$rdf$URI$$createKnown
                        },
                        'URIs': {
                            'LO_EXT_SHADING': 2106,
                            'ODF_CONTENTFILE': 2103,
                            'ODF_ELEMENT': 2102,
                            'ODF_PREFIX': 2100,
                            'ODF_STYLESFILE': 2104,
                            'ODF_SUFFIX': 2101,
                            'OWL_ALLDIFFERENT': 1211,
                            'OWL_ALLVALUESFROM': 1219,
                            'OWL_ANNOTATIONPROPERTY': 1232,
                            'OWL_BACKWARDCOMPATIBLEWITH': 1228,
                            'OWL_CARDINALITY': 1223,
                            'OWL_CLASS': 1200,
                            'OWL_COMPLEMENTOF': 1238,
                            'OWL_DATARANGE': 1235,
                            'OWL_DATATYPEPROPERTY': 1202,
                            'OWL_DEPRECATEDCLASS': 1230,
                            'OWL_DEPRECATEDPROPERTY': 1231,
                            'OWL_DIFFERENTFROM': 1210,
                            'OWL_DISJOINTWITH': 1236,
                            'OWL_DISTINCTMEMBERS': 1212,
                            'OWL_EQUIVALENTCLASS': 1207,
                            'OWL_EQUIVALENTPROPERTY': 1208,
                            'OWL_FUNCTIONALPROPERTY': 1203,
                            'OWL_HASVALUE': 1240,
                            'OWL_IMPORTS': 1225,
                            'OWL_INCOMPATIBLEWITH': 1229,
                            'OWL_INDIVIDUAL': 1206,
                            'OWL_INTERSECTIONOF': 1239,
                            'OWL_INVERSEFUNCTIONALPROPERTY': 1216,
                            'OWL_INVERSEOF': 1213,
                            'OWL_MAXCARDINALITY': 1222,
                            'OWL_MINCARDINALITY': 1221,
                            'OWL_NOTHING': 1205,
                            'OWL_OBJECTPROPERTY': 1201,
                            'OWL_ONEOF': 1234,
                            'OWL_ONPROPERTY': 1218,
                            'OWL_ONTOLOGY': 1224,
                            'OWL_ONTOLOGYPROPERTY': 1233,
                            'OWL_PRIORVERSION': 1227,
                            'OWL_RESTRICTION': 1217,
                            'OWL_SAMEAS': 1209,
                            'OWL_SOMEVALUESFROM': 1220,
                            'OWL_SYMMETRICPROPERTY': 1215,
                            'OWL_THING': 1204,
                            'OWL_TRANSITIVEPROPERTY': 1214,
                            'OWL_UNIONOF': 1237,
                            'OWL_VERSIONINFO': 1226,
                            'PKG_DOCUMENT': 2008,
                            'PKG_ELEMENT': 2005,
                            'PKG_FILE': 2006,
                            'PKG_HASPART': 2000,
                            'PKG_METADATAFILE': 2007,
                            'PKG_MIMETYPE': 2003,
                            'PKG_PACKAGE': 2004,
                            'RDFS_CLASS': 1111,
                            'RDFS_COMMENT': 1100,
                            'RDFS_CONTAINER': 1113,
                            'RDFS_CONTAINERMEMBERSHIPPROPERTY': 1114,
                            'RDFS_DATATYPE': 1112,
                            'RDFS_DOMAIN': 1102,
                            'RDFS_ISDEFINEDBY': 1108,
                            'RDFS_LABEL': 1101,
                            'RDFS_LITERAL': 1105,
                            'RDFS_MEMBER': 1106,
                            'RDFS_RANGE': 1103,
                            'RDFS_RESOURCE': 1110,
                            'RDFS_SEEALSO': 1109,
                            'RDFS_SUBCLASSOF': 1104,
                            'RDFS_SUBPROPERTYOF': 1107,
                            'RDF_1': 1015,
                            'RDF_ALT': 1011,
                            'RDF_BAG': 1012,
                            'RDF_FIRST': 1007,
                            'RDF_LIST': 1013,
                            'RDF_NIL': 1009,
                            'RDF_OBJECT': 1003,
                            'RDF_PREDICATE': 1002,
                            'RDF_PROPERTY': 1004,
                            'RDF_REST': 1008,
                            'RDF_SEQ': 1014,
                            'RDF_STATEMENT': 1005,
                            'RDF_SUBJECT': 1001,
                            'RDF_TYPE': 1000,
                            'RDF_VALUE': 1006,
                            'RDF_XMLLITERAL': 1010,
                            'XSD_ANYURI': 31,
                            'XSD_BASE64BINARY': 22,
                            'XSD_BOOLEAN': 4,
                            'XSD_BYTE': 16,
                            'XSD_DATE': 25,
                            'XSD_DATETIME': 23,
                            'XSD_DECIMAL': 5,
                            'XSD_DOUBLE': 7,
                            'XSD_DURATION': 36,
                            'XSD_ENTITIES': 44,
                            'XSD_ENTITY': 43,
                            'XSD_FLOAT': 6,
                            'XSD_GDAY': 29,
                            'XSD_GMONTH': 30,
                            'XSD_GMONTHDAY': 28,
                            'XSD_GYEAR': 27,
                            'XSD_GYEARMONTH': 26,
                            'XSD_HEXBINARY': 21,
                            'XSD_ID': 40,
                            'XSD_IDREF': 41,
                            'XSD_IDREFS': 42,
                            'XSD_INT': 14,
                            'XSD_INTEGER': 8,
                            'XSD_LANGUAGE': 33,
                            'XSD_LONG': 13,
                            'XSD_NAME': 35,
                            'XSD_NCNAME': 1,
                            'XSD_NEGATIVEINTEGER': 12,
                            'XSD_NMTOKEN': 34,
                            'XSD_NMTOKENS': 39,
                            'XSD_NONNEGATIVEINTEGER': 9,
                            'XSD_NONPOSITIVEINTEGER': 11,
                            'XSD_NORMALIZEDSTRING': 3,
                            'XSD_NOTATION': 38,
                            'XSD_POSITIVEINTEGER': 10,
                            'XSD_QNAME': 37,
                            'XSD_SHORT': 15,
                            'XSD_STRING': 2,
                            'XSD_TIME': 24,
                            'XSD_TOKEN': 32,
                            'XSD_UNSIGNEDBYTE': 20,
                            'XSD_UNSIGNEDINT': 18,
                            'XSD_UNSIGNEDLONG': 17,
                            'XSD_UNSIGNEDSHORT': 19
                        }
                    },
                    'reflection': {
                        'Dump': instance.uno_Function_com$sun$star$reflection$Dump,
                        'FieldAccessMode': instance.uno_Type_com$sun$star$reflection$FieldAccessMode,
                        'InvalidTypeNameException': instance.uno_Type_com$sun$star$reflection$InvalidTypeNameException,
                        'InvocationTargetException': instance.uno_Type_com$sun$star$reflection$InvocationTargetException,
                        'MethodMode': instance.uno_Type_com$sun$star$reflection$MethodMode,
                        'NoSuchTypeNameException': instance.uno_Type_com$sun$star$reflection$NoSuchTypeNameException,
                        'ParamInfo': instance.uno_Type_com$sun$star$reflection$ParamInfo,
                        'ParamMode': instance.uno_Type_com$sun$star$reflection$ParamMode,
                        'TypeDescriptionSearchDepth': instance.uno_Type_com$sun$star$reflection$TypeDescriptionSearchDepth,
                        'XArrayTypeDescription': instance.uno_Type_com$sun$star$reflection$XArrayTypeDescription,
                        'XCompoundTypeDescription': instance.uno_Type_com$sun$star$reflection$XCompoundTypeDescription,
                        'XConstantTypeDescription': instance.uno_Type_com$sun$star$reflection$XConstantTypeDescription,
                        'XConstantsTypeDescription': instance.uno_Type_com$sun$star$reflection$XConstantsTypeDescription,
                        'XDump': instance.uno_Type_com$sun$star$reflection$XDump,
                        'XEnumTypeDescription': instance.uno_Type_com$sun$star$reflection$XEnumTypeDescription,
                        'XIdlArray': instance.uno_Type_com$sun$star$reflection$XIdlArray,
                        'XIdlClass': instance.uno_Type_com$sun$star$reflection$XIdlClass,
                        'XIdlClassProvider': instance.uno_Type_com$sun$star$reflection$XIdlClassProvider,
                        'XIdlField': instance.uno_Type_com$sun$star$reflection$XIdlField,
                        'XIdlField2': instance.uno_Type_com$sun$star$reflection$XIdlField2,
                        'XIdlMember': instance.uno_Type_com$sun$star$reflection$XIdlMember,
                        'XIdlMethod': instance.uno_Type_com$sun$star$reflection$XIdlMethod,
                        'XIdlReflection': instance.uno_Type_com$sun$star$reflection$XIdlReflection,
                        'XIndirectTypeDescription': instance.uno_Type_com$sun$star$reflection$XIndirectTypeDescription,
                        'XInterfaceAttributeTypeDescription': instance.uno_Type_com$sun$star$reflection$XInterfaceAttributeTypeDescription,
                        'XInterfaceAttributeTypeDescription2': instance.uno_Type_com$sun$star$reflection$XInterfaceAttributeTypeDescription2,
                        'XInterfaceMemberTypeDescription': instance.uno_Type_com$sun$star$reflection$XInterfaceMemberTypeDescription,
                        'XInterfaceMethodTypeDescription': instance.uno_Type_com$sun$star$reflection$XInterfaceMethodTypeDescription,
                        'XInterfaceTypeDescription': instance.uno_Type_com$sun$star$reflection$XInterfaceTypeDescription,
                        'XInterfaceTypeDescription2': instance.uno_Type_com$sun$star$reflection$XInterfaceTypeDescription2,
                        'XMethodParameter': instance.uno_Type_com$sun$star$reflection$XMethodParameter,
                        'XModuleTypeDescription': instance.uno_Type_com$sun$star$reflection$XModuleTypeDescription,
                        'XParameter': instance.uno_Type_com$sun$star$reflection$XParameter,
                        'XPropertyTypeDescription': instance.uno_Type_com$sun$star$reflection$XPropertyTypeDescription,
                        'XProxyFactory': instance.uno_Type_com$sun$star$reflection$XProxyFactory,
                        'XPublished': instance.uno_Type_com$sun$star$reflection$XPublished,
                        'XServiceConstructorDescription': instance.uno_Type_com$sun$star$reflection$XServiceConstructorDescription,
                        'XServiceTypeDescription': instance.uno_Type_com$sun$star$reflection$XServiceTypeDescription,
                        'XServiceTypeDescription2': instance.uno_Type_com$sun$star$reflection$XServiceTypeDescription2,
                        'XSingletonTypeDescription': instance.uno_Type_com$sun$star$reflection$XSingletonTypeDescription,
                        'XSingletonTypeDescription2': instance.uno_Type_com$sun$star$reflection$XSingletonTypeDescription2,
                        'XStructTypeDescription': instance.uno_Type_com$sun$star$reflection$XStructTypeDescription,
                        'XTypeDescription': instance.uno_Type_com$sun$star$reflection$XTypeDescription,
                        'XTypeDescriptionEnumeration': instance.uno_Type_com$sun$star$reflection$XTypeDescriptionEnumeration,
                        'XTypeDescriptionEnumerationAccess': instance.uno_Type_com$sun$star$reflection$XTypeDescriptionEnumerationAccess,
                        'XUnionTypeDescription': instance.uno_Type_com$sun$star$reflection$XUnionTypeDescription,
                        'theCoreReflection': instance.uno_Function_com$sun$star$reflection$theCoreReflection,
                        'ProxyFactory': {
                            'create': instance.uno_Function_com$sun$star$reflection$ProxyFactory$$create
                        }
                    },
                    'registry': {
                        'CannotRegisterImplementationException': instance.uno_Type_com$sun$star$registry$CannotRegisterImplementationException,
                        'InvalidRegistryException': instance.uno_Type_com$sun$star$registry$InvalidRegistryException,
                        'InvalidValueException': instance.uno_Type_com$sun$star$registry$InvalidValueException,
                        'MergeConflictException': instance.uno_Type_com$sun$star$registry$MergeConflictException,
                        'RegistryKeyType': instance.uno_Type_com$sun$star$registry$RegistryKeyType,
                        'RegistryValueType': instance.uno_Type_com$sun$star$registry$RegistryValueType,
                        'XImplementationRegistration': instance.uno_Type_com$sun$star$registry$XImplementationRegistration,
                        'XImplementationRegistration2': instance.uno_Type_com$sun$star$registry$XImplementationRegistration2,
                        'XRegistryKey': instance.uno_Type_com$sun$star$registry$XRegistryKey,
                        'XSimpleRegistry': instance.uno_Type_com$sun$star$registry$XSimpleRegistry,
                        'ImplementationRegistration': {
                            'create': instance.uno_Function_com$sun$star$registry$ImplementationRegistration$$create
                        },
                        'SimpleRegistry': {
                            'create': instance.uno_Function_com$sun$star$registry$SimpleRegistry$$create
                        }
                    },
                    'rendering': {
                        'ARGBColor': instance.uno_Type_com$sun$star$rendering$ARGBColor,
                        'AnimationAttributes': instance.uno_Type_com$sun$star$rendering$AnimationAttributes,
                        'Caret': instance.uno_Type_com$sun$star$rendering$Caret,
                        'ColorProfile': instance.uno_Type_com$sun$star$rendering$ColorProfile,
                        'FillRule': instance.uno_Type_com$sun$star$rendering$FillRule,
                        'FloatingPointBitmapLayout': instance.uno_Type_com$sun$star$rendering$FloatingPointBitmapLayout,
                        'FontInfo': instance.uno_Type_com$sun$star$rendering$FontInfo,
                        'FontMetrics': instance.uno_Type_com$sun$star$rendering$FontMetrics,
                        'FontRequest': instance.uno_Type_com$sun$star$rendering$FontRequest,
                        'IntegerBitmapLayout': instance.uno_Type_com$sun$star$rendering$IntegerBitmapLayout,
                        'Panose': instance.uno_Type_com$sun$star$rendering$Panose,
                        'RGBColor': instance.uno_Type_com$sun$star$rendering$RGBColor,
                        'RenderState': instance.uno_Type_com$sun$star$rendering$RenderState,
                        'StringContext': instance.uno_Type_com$sun$star$rendering$StringContext,
                        'StrokeAttributes': instance.uno_Type_com$sun$star$rendering$StrokeAttributes,
                        'TextHit': instance.uno_Type_com$sun$star$rendering$TextHit,
                        'Texture': instance.uno_Type_com$sun$star$rendering$Texture,
                        'ViewState': instance.uno_Type_com$sun$star$rendering$ViewState,
                        'VolatileContentDestroyedException': instance.uno_Type_com$sun$star$rendering$VolatileContentDestroyedException,
                        'XAnimatedSprite': instance.uno_Type_com$sun$star$rendering$XAnimatedSprite,
                        'XAnimation': instance.uno_Type_com$sun$star$rendering$XAnimation,
                        'XBezierPolyPolygon2D': instance.uno_Type_com$sun$star$rendering$XBezierPolyPolygon2D,
                        'XBitmap': instance.uno_Type_com$sun$star$rendering$XBitmap,
                        'XBitmapCanvas': instance.uno_Type_com$sun$star$rendering$XBitmapCanvas,
                        'XBitmapPalette': instance.uno_Type_com$sun$star$rendering$XBitmapPalette,
                        'XBufferController': instance.uno_Type_com$sun$star$rendering$XBufferController,
                        'XCachedPrimitive': instance.uno_Type_com$sun$star$rendering$XCachedPrimitive,
                        'XCanvas': instance.uno_Type_com$sun$star$rendering$XCanvas,
                        'XCanvasFont': instance.uno_Type_com$sun$star$rendering$XCanvasFont,
                        'XColorSpace': instance.uno_Type_com$sun$star$rendering$XColorSpace,
                        'XCustomSprite': instance.uno_Type_com$sun$star$rendering$XCustomSprite,
                        'XGraphicDevice': instance.uno_Type_com$sun$star$rendering$XGraphicDevice,
                        'XHalfFloatBitmap': instance.uno_Type_com$sun$star$rendering$XHalfFloatBitmap,
                        'XHalfFloatReadOnlyBitmap': instance.uno_Type_com$sun$star$rendering$XHalfFloatReadOnlyBitmap,
                        'XIeeeDoubleBitmap': instance.uno_Type_com$sun$star$rendering$XIeeeDoubleBitmap,
                        'XIeeeDoubleReadOnlyBitmap': instance.uno_Type_com$sun$star$rendering$XIeeeDoubleReadOnlyBitmap,
                        'XIeeeFloatBitmap': instance.uno_Type_com$sun$star$rendering$XIeeeFloatBitmap,
                        'XIeeeFloatReadOnlyBitmap': instance.uno_Type_com$sun$star$rendering$XIeeeFloatReadOnlyBitmap,
                        'XIntegerBitmap': instance.uno_Type_com$sun$star$rendering$XIntegerBitmap,
                        'XIntegerBitmapColorSpace': instance.uno_Type_com$sun$star$rendering$XIntegerBitmapColorSpace,
                        'XIntegerReadOnlyBitmap': instance.uno_Type_com$sun$star$rendering$XIntegerReadOnlyBitmap,
                        'XLinePolyPolygon2D': instance.uno_Type_com$sun$star$rendering$XLinePolyPolygon2D,
                        'XMtfRenderer': instance.uno_Type_com$sun$star$rendering$XMtfRenderer,
                        'XParametricPolyPolygon2D': instance.uno_Type_com$sun$star$rendering$XParametricPolyPolygon2D,
                        'XPolyPolygon2D': instance.uno_Type_com$sun$star$rendering$XPolyPolygon2D,
                        'XSimpleCanvas': instance.uno_Type_com$sun$star$rendering$XSimpleCanvas,
                        'XSprite': instance.uno_Type_com$sun$star$rendering$XSprite,
                        'XSpriteCanvas': instance.uno_Type_com$sun$star$rendering$XSpriteCanvas,
                        'XTextLayout': instance.uno_Type_com$sun$star$rendering$XTextLayout,
                        'XVolatileBitmap': instance.uno_Type_com$sun$star$rendering$XVolatileBitmap,
                        'AnimationRepeat': {
                            'ONE_SHOT': 0,
                            'ONE_SHOT_PINGPONG': 1,
                            'PINGPONG': 2,
                            'REPEAT': 3
                        },
                        'BlendMode': {
                            'COLOR': 14,
                            'COLOR_BURN': 7,
                            'COLOR_DODGE': 6,
                            'DARKEN': 4,
                            'DIFFERENCE': 10,
                            'EXCLUSION': 11,
                            'HARD_LIGHT': 8,
                            'HUE': 12,
                            'LIGHTEN': 5,
                            'LUMINOSITY': 15,
                            'MULTIPLY': 1,
                            'NORMAL': 0,
                            'OVERLAY': 3,
                            'SATURATION': 13,
                            'SCREEN': 2,
                            'SOFT_LIGHT': 9
                        },
                        'Canvas': {
                            'create': instance.uno_Function_com$sun$star$rendering$Canvas$$create
                        },
                        'CanvasFactory': {
                            'create': instance.uno_Function_com$sun$star$rendering$CanvasFactory$$create
                        },
                        'ColorComponentTag': {
                            'ALPHA': 12,
                            'CIELAB_A': 19,
                            'CIELAB_B': 20,
                            'CIELAB_L': 18,
                            'CIEXYZ_X': 15,
                            'CIEXYZ_Y': 16,
                            'CIEXYZ_Z': 17,
                            'CMYKOG_GREEN': 9,
                            'CMYKOG_ORANGE': 8,
                            'CMYK_BLACK': 7,
                            'CMYK_CYAN': 4,
                            'CMYK_MAGENTA': 5,
                            'CMYK_YELLOW': 6,
                            'DEVICE': 0,
                            'GREY': 13,
                            'HSL_H': 24,
                            'HSL_L': 26,
                            'HSL_S': 25,
                            'HSV_H': 21,
                            'HSV_S': 22,
                            'HSV_V': 23,
                            'INDEX': 11,
                            'PREMULTIPLIED_ALPHA': 14,
                            'RGB_BLUE': 3,
                            'RGB_GREEN': 2,
                            'RGB_RED': 1,
                            'SPOT': 10,
                            'YCBCR_CB': 28,
                            'YCBCR_CR': 29,
                            'YCBCR_Y': 27
                        },
                        'ColorSpaceType': {
                            'CIELAB': 6,
                            'CIEXYZ': 5,
                            'CMYK': 3,
                            'CMYKOG': 4,
                            'DEVICE_COLOR': 0,
                            'GREY': 1,
                            'HSL': 9,
                            'HSV': 8,
                            'INDEXED': 11,
                            'RGB': 2,
                            'SRGB': 7,
                            'YCBCR': 10
                        },
                        'CompositeOperation': {
                            'ADD': 12,
                            'ATOP': 9,
                            'ATOP_REVERSE': 10,
                            'CLEAR': 0,
                            'DESTINATION': 2,
                            'INSIDE': 5,
                            'INSIDE_REVERSE': 6,
                            'OUTSIDE': 7,
                            'OUTSIDE_REVERSE': 8,
                            'OVER': 3,
                            'SATURATE': 13,
                            'SOURCE': 1,
                            'UNDER': 4,
                            'XOR': 11
                        },
                        'EmphasisMark': {
                            'ACCENT_ABOVE': 7,
                            'ACCENT_BELOW': 8,
                            'CIRCLE_ABOVE': 3,
                            'CIRCLE_BELOW': 4,
                            'DISC_ABOVE': 5,
                            'DISC_BELOW': 6,
                            'DOT_ABOVE': 1,
                            'DOT_BELOW': 2,
                            'NONE': 0
                        },
                        'FloatingPointBitmapFormat': {
                            'DOUBLE': 2,
                            'FLOAT': 1,
                            'HALFFLOAT': 0
                        },
                        'InterpolationMode': {
                            'BEZIERSPLINE3': 4,
                            'BEZIERSPLINE4': 5,
                            'CUBIC': 3,
                            'LINEAR': 2,
                            'NEAREST_NEIGHBOR': 1
                        },
                        'MtfRenderer': {
                            'createWithBitmapCanvas': instance.uno_Function_com$sun$star$rendering$MtfRenderer$$createWithBitmapCanvas
                        },
                        'PanoseArmStyle': {
                            'ANYTHING': 0,
                            'BENT_DOUBLE_SERIF': 11,
                            'BENT_HORIZONTAL': 7,
                            'BENT_SINGLE_SERIF': 10,
                            'BENT_VERTICAL': 9,
                            'BENT_WEDGE': 8,
                            'NO_FIT': 1,
                            'STRAIGHT_DOUBLE_SERIF': 6,
                            'STRAIGHT_HORIZONTAL': 2,
                            'STRAIGHT_SINGLE_SERIF': 5,
                            'STRAIGHT_VERTICAL': 4,
                            'STRAIGHT_WEDGE': 3
                        },
                        'PanoseContrast': {
                            'ANYTHING': 0,
                            'HIGH': 8,
                            'LOW': 4,
                            'MEDIUM': 6,
                            'MEDIUM_HIGH': 7,
                            'MEDIUM_LOW': 5,
                            'NONE': 2,
                            'NO_FIT': 1,
                            'VERY_HIGH': 9,
                            'VERY_LOW': 3
                        },
                        'PanoseFamilyTypes': {
                            'ANYTHING': 0,
                            'DECORATIVE': 4,
                            'NO_FIT': 1,
                            'PICTORIAL': 5,
                            'SCRIPT': 3,
                            'TEXT_DISPLAY': 2
                        },
                        'PanoseLetterForm': {
                            'ANYTHING': 0,
                            'NORMAL_BOXED': 4,
                            'NORMAL_CONTACT': 2,
                            'NORMAL_FLATTENED': 5,
                            'NORMAL_OFF_CENTER': 7,
                            'NORMAL_ROUNDED': 6,
                            'NORMAL_SQUARE': 8,
                            'NORMAL_WEIGHTED': 3,
                            'NO_FIT': 1,
                            'OBLIQUE_BOXED': 11,
                            'OBLIQUE_CONTACT': 9,
                            'OBLIQUE_FLATTENED': 12,
                            'OBLIQUE_OFF_CENTER': 14,
                            'OBLIQUE_ROUNDED': 13,
                            'OBLIQUE_SQUARE': 15,
                            'OBLIQUE_WEIGHTED': 10
                        },
                        'PanoseMidline': {
                            'ANYTHING': 0,
                            'CONSTANT_POINTED': 9,
                            'CONSTANT_SERIFED': 10,
                            'CONSTANT_TRIMMED': 8,
                            'HIGH_POINTED': 6,
                            'HIGH_SERIFED': 7,
                            'HIGH_TRIMMER': 5,
                            'LOW_POINTED': 12,
                            'LOW_SERIFED': 13,
                            'LOW_TRIMMED': 11,
                            'NO_FIT': 1,
                            'STANDARD_POINTED': 3,
                            'STANDARD_SERIFED': 4,
                            'STANDARD_TRIMMED': 2
                        },
                        'PanoseProportion': {
                            'ANYTHING': 0,
                            'CONDENSED': 6,
                            'EVEN_WIDTH': 4,
                            'EXPANDED': 5,
                            'MODERN': 3,
                            'MONO_SPACED': 9,
                            'NO_FIT': 1,
                            'OLD_SKOOL': 2,
                            'VERY_CONDENSED': 8,
                            'VERY_EXPANDED': 7
                        },
                        'PanoseSerifStyle': {
                            'ANYTHING': 0,
                            'BONE': 8,
                            'COVE': 2,
                            'EXAGGERATED': 9,
                            'FLARED': 14,
                            'NORMAL_SANS': 11,
                            'NO_FIT': 1,
                            'OBTUSE_COVE': 3,
                            'OBTUSE_SANS': 12,
                            'OBTUSE_SQUARE_COVE': 5,
                            'PERP_SANS': 13,
                            'ROUNDED': 15,
                            'SQUARE': 6,
                            'SQUARE_COVE': 4,
                            'THIN': 7,
                            'TRIANGLE': 10
                        },
                        'PanoseStrokeVariation': {
                            'ANYTHING': 0,
                            'GRADUAL_DIAGONAL': 2,
                            'GRADUAL_HORIZONTAL': 5,
                            'GRADUAL_TRANSITIONAL': 3,
                            'GRADUAL_VERTICAL': 4,
                            'INSTANT_VERTICAL': 8,
                            'NO_FIT': 1,
                            'RAPID_HORIZONTAL': 7,
                            'RAPID_VERTICAL': 6
                        },
                        'PanoseWeight': {
                            'ANYTHING': 0,
                            'BLACK': 10,
                            'BOLD': 8,
                            'BOOK': 5,
                            'DEMI_BOLD': 7,
                            'HEAVY': 9,
                            'LIGHT': 3,
                            'MEDIUM': 6,
                            'NORD': 11,
                            'NO_FIT': 1,
                            'THIN': 4,
                            'VERY_LIGHT': 2
                        },
                        'PanoseXHeight': {
                            'ANYTHING': 0,
                            'CONSTANT_LARGE': 4,
                            'CONSTANT_SMALL': 2,
                            'CONSTANT_STANDARD': 3,
                            'DUCKING_LARGE': 7,
                            'DUCKING_SMALL': 5,
                            'DUCKING_STANDARD': 6,
                            'NO_FIT': 1
                        },
                        'PathCapType': {
                            'BUTT': 0,
                            'ROUND': 1,
                            'SQUARE': 2
                        },
                        'PathJoinType': {
                            'BEVEL': 3,
                            'MITER': 1,
                            'NONE': 0,
                            'ROUND': 2
                        },
                        'RenderingIntent': {
                            'ABSOLUTE_COLORIMETRIC': 3,
                            'PERCEPTUAL': 0,
                            'RELATIVE_COLORIMETRIC': 2,
                            'SATURATION': 1
                        },
                        'RepaintResult': {
                            'DRAFTED': 2,
                            'FAILED': 3,
                            'REDRAWN': 1
                        },
                        'TextDirection': {
                            'STRONG_LEFT_TO_RIGHT': 2,
                            'STRONG_RIGHT_TO_LEFT': 3,
                            'WEAK_LEFT_TO_RIGHT': 0,
                            'WEAK_RIGHT_TO_LEFT': 1
                        },
                        'TexturingMode': {
                            'CLAMP': 1,
                            'NONE': 0,
                            'REPEAT': 2
                        }
                    },
                    'report': {
                        'XFixedLine': instance.uno_Type_com$sun$star$report$XFixedLine,
                        'XFixedText': instance.uno_Type_com$sun$star$report$XFixedText,
                        'XFormatCondition': instance.uno_Type_com$sun$star$report$XFormatCondition,
                        'XFormattedField': instance.uno_Type_com$sun$star$report$XFormattedField,
                        'XFunction': instance.uno_Type_com$sun$star$report$XFunction,
                        'XFunctions': instance.uno_Type_com$sun$star$report$XFunctions,
                        'XFunctionsSupplier': instance.uno_Type_com$sun$star$report$XFunctionsSupplier,
                        'XGroup': instance.uno_Type_com$sun$star$report$XGroup,
                        'XGroups': instance.uno_Type_com$sun$star$report$XGroups,
                        'XImageControl': instance.uno_Type_com$sun$star$report$XImageControl,
                        'XReportComponent': instance.uno_Type_com$sun$star$report$XReportComponent,
                        'XReportControlFormat': instance.uno_Type_com$sun$star$report$XReportControlFormat,
                        'XReportControlModel': instance.uno_Type_com$sun$star$report$XReportControlModel,
                        'XReportDefinition': instance.uno_Type_com$sun$star$report$XReportDefinition,
                        'XReportEngine': instance.uno_Type_com$sun$star$report$XReportEngine,
                        'XSection': instance.uno_Type_com$sun$star$report$XSection,
                        'XShape': instance.uno_Type_com$sun$star$report$XShape,
                        'Calculation': {
                            'AVERAGE': 1,
                            'CORRELATION': 2,
                            'COUNT': 3,
                            'COVARIANCE': 4,
                            'DISTINCTCOUNT': 5,
                            'MAXIMUM': 6,
                            'MEDIAN': 7,
                            'MINIMUM': 8,
                            'MODE': 9,
                            'NONE': 0,
                            'NTHLARGEST': 10,
                            'NTHMOSTFREQUENT': 11,
                            'NTHSMALLEST': 12,
                            'PERCENTAGE': 13,
                            'PERCENTILE': 14,
                            'POPSTANDARDDEVIATION': 15,
                            'POPVARIANCE': 16,
                            'SAMPLESTANDARDDEVIATION': 17,
                            'SAMPLEVARIANCE': 18,
                            'SUM': 19,
                            'WEIGHTEDAVG': 20
                        },
                        'FixedLine': {
                            'create': instance.uno_Function_com$sun$star$report$FixedLine$$create
                        },
                        'FixedText': {
                            'create': instance.uno_Function_com$sun$star$report$FixedText$$create
                        },
                        'ForceNewPage': {
                            'AFTER_SECTION': 2,
                            'BEFORE_AFTER_SECTION': 3,
                            'BEFORE_SECTION': 1,
                            'NONE': 0
                        },
                        'FormatCondition': {
                            'create': instance.uno_Function_com$sun$star$report$FormatCondition$$create
                        },
                        'FormattedField': {
                            'create': instance.uno_Function_com$sun$star$report$FormattedField$$create
                        },
                        'Function': {
                            'create': instance.uno_Function_com$sun$star$report$Function$$create
                        },
                        'Group': {
                            'create': instance.uno_Function_com$sun$star$report$Group$$create
                        },
                        'GroupKeepTogether': {
                            'PER_COLUMN': 1,
                            'PER_PAGE': 0
                        },
                        'GroupOn': {
                            'DAY': 6,
                            'DEFAULT': 0,
                            'HOUR': 7,
                            'INTERVAL': 9,
                            'MINUTE': 8,
                            'MONTH': 4,
                            'PREFIX_CHARACTERS': 1,
                            'QUARTAL': 3,
                            'WEEK': 5,
                            'YEAR': 2
                        },
                        'Groups': {
                            'create': instance.uno_Function_com$sun$star$report$Groups$$create
                        },
                        'ImageControl': {
                            'create': instance.uno_Function_com$sun$star$report$ImageControl$$create
                        },
                        'KeepTogether': {
                            'NO': 0,
                            'WHOLE_GROUP': 1,
                            'WITH_FIRST_DETAIL': 2
                        },
                        'ReportControlFormat': {
                            'create': instance.uno_Function_com$sun$star$report$ReportControlFormat$$create
                        },
                        'ReportControlModel': {
                            'create': instance.uno_Function_com$sun$star$report$ReportControlModel$$create
                        },
                        'ReportDefinition': {
                            'create': instance.uno_Function_com$sun$star$report$ReportDefinition$$create
                        },
                        'ReportEngine': {
                            'create': instance.uno_Function_com$sun$star$report$ReportEngine$$create
                        },
                        'ReportPrintOption': {
                            'ALL_PAGES': 0,
                            'NOT_WITH_REPORT_FOOTER': 2,
                            'NOT_WITH_REPORT_HEADER': 1,
                            'NOT_WITH_REPORT_HEADER_FOOTER': 3
                        },
                        'Section': {
                            'create': instance.uno_Function_com$sun$star$report$Section$$create
                        },
                        'SectionPageBreak': {
                            'AUTO': 2,
                            'NONE': 0,
                            'SECTION': 1
                        },
                        'Shape': {
                            'create': instance.uno_Function_com$sun$star$report$Shape$$create
                        },
                        'inspection': {
                            'DefaultComponentInspectorModel': {
                                'createDefault': instance.uno_Function_com$sun$star$report$inspection$DefaultComponentInspectorModel$$createDefault,
                                'createWithHelpSection': instance.uno_Function_com$sun$star$report$inspection$DefaultComponentInspectorModel$$createWithHelpSection
                            }
                        },
                        'meta': {
                            'XFormulaParser': instance.uno_Type_com$sun$star$report$meta$XFormulaParser,
                            'XFunctionCategory': instance.uno_Type_com$sun$star$report$meta$XFunctionCategory,
                            'XFunctionDescription': instance.uno_Type_com$sun$star$report$meta$XFunctionDescription,
                            'XFunctionManager': instance.uno_Type_com$sun$star$report$meta$XFunctionManager
                        }
                    },
                    'resource': {
                        'MissingResourceException': instance.uno_Type_com$sun$star$resource$MissingResourceException,
                        'XStringResourceManager': instance.uno_Type_com$sun$star$resource$XStringResourceManager,
                        'XStringResourcePersistence': instance.uno_Type_com$sun$star$resource$XStringResourcePersistence,
                        'XStringResourceResolver': instance.uno_Type_com$sun$star$resource$XStringResourceResolver,
                        'XStringResourceSupplier': instance.uno_Type_com$sun$star$resource$XStringResourceSupplier,
                        'XStringResourceWithLocation': instance.uno_Type_com$sun$star$resource$XStringResourceWithLocation,
                        'XStringResourceWithStorage': instance.uno_Type_com$sun$star$resource$XStringResourceWithStorage,
                        'StringResource': {
                            'create': instance.uno_Function_com$sun$star$resource$StringResource$$create
                        },
                        'StringResourceWithLocation': {
                            'create': instance.uno_Function_com$sun$star$resource$StringResourceWithLocation$$create
                        },
                        'StringResourceWithStorage': {
                            'create': instance.uno_Function_com$sun$star$resource$StringResourceWithStorage$$create
                        }
                    },
                    'scanner': {
                        'ScanError': instance.uno_Type_com$sun$star$scanner$ScanError,
                        'ScannerContext': instance.uno_Type_com$sun$star$scanner$ScannerContext,
                        'ScannerException': instance.uno_Type_com$sun$star$scanner$ScannerException,
                        'XScannerManager': instance.uno_Type_com$sun$star$scanner$XScannerManager,
                        'XScannerManager2': instance.uno_Type_com$sun$star$scanner$XScannerManager2,
                        'ScannerManager': {
                            'create': instance.uno_Function_com$sun$star$scanner$ScannerManager$$create
                        }
                    },
                    'script': {
                        'AllEventObject': instance.uno_Type_com$sun$star$script$AllEventObject,
                        'ArrayWrapper': instance.uno_Type_com$sun$star$script$ArrayWrapper,
                        'BasicErrorException': instance.uno_Type_com$sun$star$script$BasicErrorException,
                        'CannotConvertException': instance.uno_Type_com$sun$star$script$CannotConvertException,
                        'CannotCreateAdapterException': instance.uno_Type_com$sun$star$script$CannotCreateAdapterException,
                        'ContextInformation': instance.uno_Type_com$sun$star$script$ContextInformation,
                        'EventListener': instance.uno_Type_com$sun$star$script$EventListener,
                        'FinishEngineEvent': instance.uno_Type_com$sun$star$script$FinishEngineEvent,
                        'FinishReason': instance.uno_Type_com$sun$star$script$FinishReason,
                        'InterruptEngineEvent': instance.uno_Type_com$sun$star$script$InterruptEngineEvent,
                        'InterruptReason': instance.uno_Type_com$sun$star$script$InterruptReason,
                        'InvocationInfo': instance.uno_Type_com$sun$star$script$InvocationInfo,
                        'MemberType': instance.uno_Type_com$sun$star$script$MemberType,
                        'ScriptEvent': instance.uno_Type_com$sun$star$script$ScriptEvent,
                        'ScriptEventDescriptor': instance.uno_Type_com$sun$star$script$ScriptEventDescriptor,
                        'XAllListener': instance.uno_Type_com$sun$star$script$XAllListener,
                        'XAllListenerAdapterService': instance.uno_Type_com$sun$star$script$XAllListenerAdapterService,
                        'XAutomationInvocation': instance.uno_Type_com$sun$star$script$XAutomationInvocation,
                        'XDebugging': instance.uno_Type_com$sun$star$script$XDebugging,
                        'XDefaultMethod': instance.uno_Type_com$sun$star$script$XDefaultMethod,
                        'XDefaultProperty': instance.uno_Type_com$sun$star$script$XDefaultProperty,
                        'XDirectInvocation': instance.uno_Type_com$sun$star$script$XDirectInvocation,
                        'XEngine': instance.uno_Type_com$sun$star$script$XEngine,
                        'XEngineListener': instance.uno_Type_com$sun$star$script$XEngineListener,
                        'XErrorQuery': instance.uno_Type_com$sun$star$script$XErrorQuery,
                        'XEventAttacher': instance.uno_Type_com$sun$star$script$XEventAttacher,
                        'XEventAttacher2': instance.uno_Type_com$sun$star$script$XEventAttacher2,
                        'XEventAttacherManager': instance.uno_Type_com$sun$star$script$XEventAttacherManager,
                        'XInvocation': instance.uno_Type_com$sun$star$script$XInvocation,
                        'XInvocation2': instance.uno_Type_com$sun$star$script$XInvocation2,
                        'XInvocationAdapterFactory': instance.uno_Type_com$sun$star$script$XInvocationAdapterFactory,
                        'XInvocationAdapterFactory2': instance.uno_Type_com$sun$star$script$XInvocationAdapterFactory2,
                        'XLibraryAccess': instance.uno_Type_com$sun$star$script$XLibraryAccess,
                        'XScriptEventsAttacher': instance.uno_Type_com$sun$star$script$XScriptEventsAttacher,
                        'XScriptEventsSupplier': instance.uno_Type_com$sun$star$script$XScriptEventsSupplier,
                        'XScriptListener': instance.uno_Type_com$sun$star$script$XScriptListener,
                        'XStarBasicAccess': instance.uno_Type_com$sun$star$script$XStarBasicAccess,
                        'XStarBasicDialogInfo': instance.uno_Type_com$sun$star$script$XStarBasicDialogInfo,
                        'XStarBasicLibraryInfo': instance.uno_Type_com$sun$star$script$XStarBasicLibraryInfo,
                        'XStarBasicModuleInfo': instance.uno_Type_com$sun$star$script$XStarBasicModuleInfo,
                        'XTypeConverter': instance.uno_Type_com$sun$star$script$XTypeConverter,
                        'LibraryNotLoadedException': instance.uno_Type_com$sun$star$script$LibraryNotLoadedException,
                        'ModuleInfo': instance.uno_Type_com$sun$star$script$ModuleInfo,
                        'ModuleSizeExceededRequest': instance.uno_Type_com$sun$star$script$ModuleSizeExceededRequest,
                        'NativeObjectWrapper': instance.uno_Type_com$sun$star$script$NativeObjectWrapper,
                        'XLibraryContainer': instance.uno_Type_com$sun$star$script$XLibraryContainer,
                        'XLibraryContainer2': instance.uno_Type_com$sun$star$script$XLibraryContainer2,
                        'XLibraryContainer3': instance.uno_Type_com$sun$star$script$XLibraryContainer3,
                        'XLibraryContainerExport': instance.uno_Type_com$sun$star$script$XLibraryContainerExport,
                        'XLibraryContainerPassword': instance.uno_Type_com$sun$star$script$XLibraryContainerPassword,
                        'XLibraryQueryExecutable': instance.uno_Type_com$sun$star$script$XLibraryQueryExecutable,
                        'XPersistentLibraryContainer': instance.uno_Type_com$sun$star$script$XPersistentLibraryContainer,
                        'XServiceDocumenter': instance.uno_Type_com$sun$star$script$XServiceDocumenter,
                        'XStorageBasedLibraryContainer': instance.uno_Type_com$sun$star$script$XStorageBasedLibraryContainer,
                        'theServiceDocumenter': instance.uno_Function_com$sun$star$script$theServiceDocumenter,
                        'AllListenerAdapter': {
                            'create': instance.uno_Function_com$sun$star$script$AllListenerAdapter$$create
                        },
                        'Converter': {
                            'create': instance.uno_Function_com$sun$star$script$Converter$$create
                        },
                        'DocumentDialogLibraryContainer': {
                            'create': instance.uno_Function_com$sun$star$script$DocumentDialogLibraryContainer$$create,
                            'createWithURL': instance.uno_Function_com$sun$star$script$DocumentDialogLibraryContainer$$createWithURL
                        },
                        'DocumentScriptLibraryContainer': {
                            'create': instance.uno_Function_com$sun$star$script$DocumentScriptLibraryContainer$$create,
                            'createWithURL': instance.uno_Function_com$sun$star$script$DocumentScriptLibraryContainer$$createWithURL
                        },
                        'FailReason': {
                            'INVALID': 8,
                            'IS_NOT_BOOL': 4,
                            'IS_NOT_ENUM': 3,
                            'IS_NOT_NUMBER': 2,
                            'NO_DEFAULT_AVAILABLE': 9,
                            'NO_SUCH_INTERFACE': 5,
                            'OUT_OF_RANGE': 1,
                            'SOURCE_IS_NO_DERIVED_TYPE': 6,
                            'TYPE_NOT_SUPPORTED': 7,
                            'UNKNOWN': 10
                        },
                        'Invocation': {
                            'create': instance.uno_Function_com$sun$star$script$Invocation$$create
                        },
                        'InvocationAdapterFactory': {
                            'create': instance.uno_Function_com$sun$star$script$InvocationAdapterFactory$$create
                        },
                        'ModuleType': {
                            'CLASS': 2,
                            'DOCUMENT': 4,
                            'FORM': 3,
                            'NORMAL': 1,
                            'UNKNOWN': 0
                        },
                        'browse': {
                            'XBrowseNode': instance.uno_Type_com$sun$star$script$browse$XBrowseNode,
                            'XBrowseNodeFactory': instance.uno_Type_com$sun$star$script$browse$XBrowseNodeFactory,
                            'theBrowseNodeFactory': instance.uno_Function_com$sun$star$script$browse$theBrowseNodeFactory,
                            'BrowseNodeFactoryViewTypes': {
                                'MACROORGANIZER': 1,
                                'MACROSELECTOR': 0
                            },
                            'BrowseNodeTypes': {
                                'CONTAINER': 1,
                                'ROOT': 2,
                                'SCRIPT': 0
                            }
                        },
                        'provider': {
                            'ScriptErrorRaisedException': instance.uno_Type_com$sun$star$script$provider$ScriptErrorRaisedException,
                            'ScriptExceptionRaisedException': instance.uno_Type_com$sun$star$script$provider$ScriptExceptionRaisedException,
                            'ScriptFrameworkErrorException': instance.uno_Type_com$sun$star$script$provider$ScriptFrameworkErrorException,
                            'XScript': instance.uno_Type_com$sun$star$script$provider$XScript,
                            'XScriptContext': instance.uno_Type_com$sun$star$script$provider$XScriptContext,
                            'XScriptProvider': instance.uno_Type_com$sun$star$script$provider$XScriptProvider,
                            'XScriptProviderFactory': instance.uno_Type_com$sun$star$script$provider$XScriptProviderFactory,
                            'XScriptProviderSupplier': instance.uno_Type_com$sun$star$script$provider$XScriptProviderSupplier,
                            'XScriptURIHelper': instance.uno_Type_com$sun$star$script$provider$XScriptURIHelper,
                            'theMasterScriptProviderFactory': instance.uno_Function_com$sun$star$script$provider$theMasterScriptProviderFactory,
                            'MasterScriptProviderFactory': {
                                'create': instance.uno_Function_com$sun$star$script$provider$MasterScriptProviderFactory$$create
                            },
                            'ScriptFrameworkErrorType': {
                                'MALFORMED_URL': 3,
                                'NOTSUPPORTED': 1,
                                'NO_SUCH_SCRIPT': 2,
                                'UNKNOWN': 0
                            },
                            'ScriptURIHelper': {
                                'create': instance.uno_Function_com$sun$star$script$provider$ScriptURIHelper$$create
                            }
                        },
                        'vba': {
                            'VBAScriptEvent': instance.uno_Type_com$sun$star$script$vba$VBAScriptEvent,
                            'XVBACompatibility': instance.uno_Type_com$sun$star$script$vba$XVBACompatibility,
                            'XVBAEventProcessor': instance.uno_Type_com$sun$star$script$vba$XVBAEventProcessor,
                            'XVBAMacroResolver': instance.uno_Type_com$sun$star$script$vba$XVBAMacroResolver,
                            'XVBAModuleInfo': instance.uno_Type_com$sun$star$script$vba$XVBAModuleInfo,
                            'XVBAScriptListener': instance.uno_Type_com$sun$star$script$vba$XVBAScriptListener,
                            'VBAEventId': {
                                'AUTO_CLOSE': 3,
                                'AUTO_EXEC': 4,
                                'AUTO_EXIT': 5,
                                'AUTO_NEW': 1,
                                'AUTO_OPEN': 2,
                                'DOCUMENT_CLOSE': 1003,
                                'DOCUMENT_NEW': 1001,
                                'DOCUMENT_OPEN': 1002,
                                'NO_EVENT': -1,
                                'USERDEFINED_START': 1000000,
                                'WORKBOOK_ACTIVATE': 2001,
                                'WORKBOOK_AFTERSAVE': 2007,
                                'WORKBOOK_BEFORECLOSE': 2004,
                                'WORKBOOK_BEFOREPRINT': 2005,
                                'WORKBOOK_BEFORESAVE': 2006,
                                'WORKBOOK_DEACTIVATE': 2002,
                                'WORKBOOK_NEWSHEET': 2008,
                                'WORKBOOK_OPEN': 2003,
                                'WORKBOOK_WINDOWACTIVATE': 2009,
                                'WORKBOOK_WINDOWDEACTIVATE': 2010,
                                'WORKBOOK_WINDOWRESIZE': 2011,
                                'WORKSHEET_ACTIVATE': 2101,
                                'WORKSHEET_BEFOREDOUBLECLICK': 2103,
                                'WORKSHEET_BEFORERIGHTCLICK': 2104,
                                'WORKSHEET_CALCULATE': 2105,
                                'WORKSHEET_CHANGE': 2106,
                                'WORKSHEET_DEACTIVATE': 2102,
                                'WORKSHEET_FOLLOWHYPERLINK': 2108,
                                'WORKSHEET_SELECTIONCHANGE': 2107
                            },
                            'VBAScriptEventId': {
                                'INITIALIZE_USERFORM': 2,
                                'SCRIPT_STARTED': 0,
                                'SCRIPT_STOPPED': 1
                            }
                        }
                    },
                    'sdb': {
                        'DataAccessDescriptorFactory': instance.uno_Function_com$sun$star$sdb$DataAccessDescriptorFactory,
                        'DatabaseRegistrationEvent': instance.uno_Type_com$sun$star$sdb$DatabaseRegistrationEvent,
                        'DocumentSaveRequest': instance.uno_Type_com$sun$star$sdb$DocumentSaveRequest,
                        'ParametersRequest': instance.uno_Type_com$sun$star$sdb$ParametersRequest,
                        'RowChangeEvent': instance.uno_Type_com$sun$star$sdb$RowChangeEvent,
                        'RowSetVetoException': instance.uno_Type_com$sun$star$sdb$RowSetVetoException,
                        'RowsChangeEvent': instance.uno_Type_com$sun$star$sdb$RowsChangeEvent,
                        'SQLContext': instance.uno_Type_com$sun$star$sdb$SQLContext,
                        'SQLErrorEvent': instance.uno_Type_com$sun$star$sdb$SQLErrorEvent,
                        'XAlterQuery': instance.uno_Type_com$sun$star$sdb$XAlterQuery,
                        'XBookmarksSupplier': instance.uno_Type_com$sun$star$sdb$XBookmarksSupplier,
                        'XColumn': instance.uno_Type_com$sun$star$sdb$XColumn,
                        'XColumnUpdate': instance.uno_Type_com$sun$star$sdb$XColumnUpdate,
                        'XCommandPreparation': instance.uno_Type_com$sun$star$sdb$XCommandPreparation,
                        'XCompletedConnection': instance.uno_Type_com$sun$star$sdb$XCompletedConnection,
                        'XCompletedExecution': instance.uno_Type_com$sun$star$sdb$XCompletedExecution,
                        'XDataAccessDescriptorFactory': instance.uno_Type_com$sun$star$sdb$XDataAccessDescriptorFactory,
                        'XDatabaseAccess': instance.uno_Type_com$sun$star$sdb$XDatabaseAccess,
                        'XDatabaseAccessListener': instance.uno_Type_com$sun$star$sdb$XDatabaseAccessListener,
                        'XDatabaseContext': instance.uno_Type_com$sun$star$sdb$XDatabaseContext,
                        'XDatabaseEnvironment': instance.uno_Type_com$sun$star$sdb$XDatabaseEnvironment,
                        'XDatabaseRegistrations': instance.uno_Type_com$sun$star$sdb$XDatabaseRegistrations,
                        'XDatabaseRegistrationsListener': instance.uno_Type_com$sun$star$sdb$XDatabaseRegistrationsListener,
                        'XDocumentDataSource': instance.uno_Type_com$sun$star$sdb$XDocumentDataSource,
                        'XFormDocumentsSupplier': instance.uno_Type_com$sun$star$sdb$XFormDocumentsSupplier,
                        'XInteractionDocumentSave': instance.uno_Type_com$sun$star$sdb$XInteractionDocumentSave,
                        'XInteractionSupplyParameters': instance.uno_Type_com$sun$star$sdb$XInteractionSupplyParameters,
                        'XOfficeDatabaseDocument': instance.uno_Type_com$sun$star$sdb$XOfficeDatabaseDocument,
                        'XParametersSupplier': instance.uno_Type_com$sun$star$sdb$XParametersSupplier,
                        'XQueriesSupplier': instance.uno_Type_com$sun$star$sdb$XQueriesSupplier,
                        'XQueryDefinition': instance.uno_Type_com$sun$star$sdb$XQueryDefinition,
                        'XQueryDefinitionsSupplier': instance.uno_Type_com$sun$star$sdb$XQueryDefinitionsSupplier,
                        'XReportDocumentsSupplier': instance.uno_Type_com$sun$star$sdb$XReportDocumentsSupplier,
                        'XResultSetAccess': instance.uno_Type_com$sun$star$sdb$XResultSetAccess,
                        'XRowSetApproveBroadcaster': instance.uno_Type_com$sun$star$sdb$XRowSetApproveBroadcaster,
                        'XRowSetApproveListener': instance.uno_Type_com$sun$star$sdb$XRowSetApproveListener,
                        'XRowSetChangeBroadcaster': instance.uno_Type_com$sun$star$sdb$XRowSetChangeBroadcaster,
                        'XRowSetChangeListener': instance.uno_Type_com$sun$star$sdb$XRowSetChangeListener,
                        'XRowSetSupplier': instance.uno_Type_com$sun$star$sdb$XRowSetSupplier,
                        'XRowsChangeBroadcaster': instance.uno_Type_com$sun$star$sdb$XRowsChangeBroadcaster,
                        'XRowsChangeListener': instance.uno_Type_com$sun$star$sdb$XRowsChangeListener,
                        'XSQLErrorBroadcaster': instance.uno_Type_com$sun$star$sdb$XSQLErrorBroadcaster,
                        'XSQLErrorListener': instance.uno_Type_com$sun$star$sdb$XSQLErrorListener,
                        'XSQLQueryComposer': instance.uno_Type_com$sun$star$sdb$XSQLQueryComposer,
                        'XSQLQueryComposerFactory': instance.uno_Type_com$sun$star$sdb$XSQLQueryComposerFactory,
                        'XSingleSelectQueryAnalyzer': instance.uno_Type_com$sun$star$sdb$XSingleSelectQueryAnalyzer,
                        'XSingleSelectQueryComposer': instance.uno_Type_com$sun$star$sdb$XSingleSelectQueryComposer,
                        'XSubDocument': instance.uno_Type_com$sun$star$sdb$XSubDocument,
                        'XTextConnectionSettings': instance.uno_Type_com$sun$star$sdb$XTextConnectionSettings,
                        'BooleanComparisonMode': {
                            'ACCESS_COMPAT': 3,
                            'EQUAL_INTEGER': 0,
                            'EQUAL_LITERAL': 2,
                            'IS_LITERAL': 1
                        },
                        'CommandDefinition': {
                            'create': instance.uno_Function_com$sun$star$sdb$CommandDefinition$$create
                        },
                        'CommandType': {
                            'COMMAND': 2,
                            'QUERY': 1,
                            'TABLE': 0
                        },
                        'DatabaseContext': {
                            'create': instance.uno_Function_com$sun$star$sdb$DatabaseContext$$create
                        },
                        'DatabaseInteractionHandler': {
                            'create': instance.uno_Function_com$sun$star$sdb$DatabaseInteractionHandler$$create
                        },
                        'ErrorCondition': {
                            'AB_ADDRESSBOOK_NOT_FOUND': 500,
                            'DATA_CANNOT_SELECT_UNFILTERED': 550,
                            'DB_INVALID_SQL_NAME': 301,
                            'DB_NOT_CONNECTED': 304,
                            'DB_OBJECT_NAME_IS_USED': 303,
                            'DB_OBJECT_NAME_WITH_SLASHES': 300,
                            'DB_QUERY_NAME_WITH_QUOTES': 302,
                            'PARSER_CYCLIC_SUB_QUERIES': 200,
                            'ROW_SET_OPERATION_VETOED': 100
                        },
                        'ErrorMessageDialog': {
                            'create': instance.uno_Function_com$sun$star$sdb$ErrorMessageDialog$$create
                        },
                        'FilterDialog': {
                            'createDefault': instance.uno_Function_com$sun$star$sdb$FilterDialog$$createDefault,
                            'createWithQuery': instance.uno_Function_com$sun$star$sdb$FilterDialog$$createWithQuery
                        },
                        'InteractionHandler': {
                            'create': instance.uno_Function_com$sun$star$sdb$InteractionHandler$$create
                        },
                        'OrderDialog': {
                            'createDefault': instance.uno_Function_com$sun$star$sdb$OrderDialog$$createDefault,
                            'createWithQuery': instance.uno_Function_com$sun$star$sdb$OrderDialog$$createWithQuery
                        },
                        'QueryDefinition': {
                            'create': instance.uno_Function_com$sun$star$sdb$QueryDefinition$$create
                        },
                        'ReportDesign': {
                            'create': instance.uno_Function_com$sun$star$sdb$ReportDesign$$create
                        },
                        'RowChangeAction': {
                            'DELETE': 3,
                            'INSERT': 1,
                            'UPDATE': 2
                        },
                        'SQLFilterOperator': {
                            'EQUAL': 1,
                            'GREATER': 4,
                            'GREATER_EQUAL': 6,
                            'LESS': 3,
                            'LESS_EQUAL': 5,
                            'LIKE': 7,
                            'NOT_EQUAL': 2,
                            'NOT_LIKE': 8,
                            'NOT_SQLNULL': 10,
                            'SQLNULL': 9
                        },
                        'TableDefinition': {
                            'createDefault': instance.uno_Function_com$sun$star$sdb$TableDefinition$$createDefault,
                            'createWithName': instance.uno_Function_com$sun$star$sdb$TableDefinition$$createWithName
                        },
                        'TextConnectionSettings': {
                            'create': instance.uno_Function_com$sun$star$sdb$TextConnectionSettings$$create
                        },
                        'application': {
                            'CopyTableRowEvent': instance.uno_Type_com$sun$star$sdb$application$CopyTableRowEvent,
                            'NamedDatabaseObject': instance.uno_Type_com$sun$star$sdb$application$NamedDatabaseObject,
                            'XCopyTableListener': instance.uno_Type_com$sun$star$sdb$application$XCopyTableListener,
                            'XCopyTableWizard': instance.uno_Type_com$sun$star$sdb$application$XCopyTableWizard,
                            'XDatabaseDocumentUI': instance.uno_Type_com$sun$star$sdb$application$XDatabaseDocumentUI,
                            'XTableUIProvider': instance.uno_Type_com$sun$star$sdb$application$XTableUIProvider,
                            'CopyTableContinuation': {
                                'AskUser': 3,
                                'CallNextHandler': 1,
                                'Cancel': 2,
                                'Proceed': 0
                            },
                            'CopyTableOperation': {
                                'AppendData': 3,
                                'CopyDefinitionAndData': 0,
                                'CopyDefinitionOnly': 1,
                                'CreateAsView': 2
                            },
                            'CopyTableWizard': {
                                'create': instance.uno_Function_com$sun$star$sdb$application$CopyTableWizard$$create,
                                'createWithInteractionHandler': instance.uno_Function_com$sun$star$sdb$application$CopyTableWizard$$createWithInteractionHandler
                            },
                            'DatabaseObject': {
                                'FORM': 2,
                                'QUERY': 1,
                                'REPORT': 3,
                                'TABLE': 0
                            },
                            'DatabaseObjectContainer': {
                                'CATALOG': 1005,
                                'DATA_SOURCE': 1004,
                                'FORMS': 1002,
                                'FORMS_FOLDER': 1007,
                                'QUERIES': 1001,
                                'REPORTS': 1003,
                                'REPORTS_FOLDER': 1008,
                                'SCHEMA': 1006,
                                'TABLES': 1000
                            }
                        },
                        'tools': {
                            'XConnectionSupplier': instance.uno_Type_com$sun$star$sdb$tools$XConnectionSupplier,
                            'XConnectionTools': instance.uno_Type_com$sun$star$sdb$tools$XConnectionTools,
                            'XDataSourceMetaData': instance.uno_Type_com$sun$star$sdb$tools$XDataSourceMetaData,
                            'XIndexAlteration': instance.uno_Type_com$sun$star$sdb$tools$XIndexAlteration,
                            'XKeyAlteration': instance.uno_Type_com$sun$star$sdb$tools$XKeyAlteration,
                            'XObjectNames': instance.uno_Type_com$sun$star$sdb$tools$XObjectNames,
                            'XTableAlteration': instance.uno_Type_com$sun$star$sdb$tools$XTableAlteration,
                            'XTableName': instance.uno_Type_com$sun$star$sdb$tools$XTableName,
                            'XTableRename': instance.uno_Type_com$sun$star$sdb$tools$XTableRename,
                            'XViewAccess': instance.uno_Type_com$sun$star$sdb$tools$XViewAccess,
                            'CompositionType': {
                                'Complete': 5,
                                'ForDataManipulation': 2,
                                'ForIndexDefinitions': 1,
                                'ForPrivilegeDefinitions': 4,
                                'ForProcedureCalls': 3,
                                'ForTableDefinitions': 0
                            },
                            'ConnectionTools': {
                                'createWithConnection': instance.uno_Function_com$sun$star$sdb$tools$ConnectionTools$$createWithConnection
                            }
                        }
                    },
                    'sdbc': {
                        'BatchUpdateException': instance.uno_Type_com$sun$star$sdbc$BatchUpdateException,
                        'ChangeEvent': instance.uno_Type_com$sun$star$sdbc$ChangeEvent,
                        'DataTruncation': instance.uno_Type_com$sun$star$sdbc$DataTruncation,
                        'DriverPropertyInfo': instance.uno_Type_com$sun$star$sdbc$DriverPropertyInfo,
                        'SQLException': instance.uno_Type_com$sun$star$sdbc$SQLException,
                        'SQLWarning': instance.uno_Type_com$sun$star$sdbc$SQLWarning,
                        'XArray': instance.uno_Type_com$sun$star$sdbc$XArray,
                        'XBatchExecution': instance.uno_Type_com$sun$star$sdbc$XBatchExecution,
                        'XBlob': instance.uno_Type_com$sun$star$sdbc$XBlob,
                        'XClob': instance.uno_Type_com$sun$star$sdbc$XClob,
                        'XCloseable': instance.uno_Type_com$sun$star$sdbc$XCloseable,
                        'XColumnLocate': instance.uno_Type_com$sun$star$sdbc$XColumnLocate,
                        'XConnection': instance.uno_Type_com$sun$star$sdbc$XConnection,
                        'XConnectionPool': instance.uno_Type_com$sun$star$sdbc$XConnectionPool,
                        'XDataSource': instance.uno_Type_com$sun$star$sdbc$XDataSource,
                        'XDatabaseMetaData': instance.uno_Type_com$sun$star$sdbc$XDatabaseMetaData,
                        'XDatabaseMetaData2': instance.uno_Type_com$sun$star$sdbc$XDatabaseMetaData2,
                        'XDriver': instance.uno_Type_com$sun$star$sdbc$XDriver,
                        'XDriverAccess': instance.uno_Type_com$sun$star$sdbc$XDriverAccess,
                        'XDriverManager': instance.uno_Type_com$sun$star$sdbc$XDriverManager,
                        'XDriverManager2': instance.uno_Type_com$sun$star$sdbc$XDriverManager2,
                        'XGeneratedResultSet': instance.uno_Type_com$sun$star$sdbc$XGeneratedResultSet,
                        'XIsolatedConnection': instance.uno_Type_com$sun$star$sdbc$XIsolatedConnection,
                        'XMultipleResults': instance.uno_Type_com$sun$star$sdbc$XMultipleResults,
                        'XOutParameters': instance.uno_Type_com$sun$star$sdbc$XOutParameters,
                        'XParameters': instance.uno_Type_com$sun$star$sdbc$XParameters,
                        'XPooledConnection': instance.uno_Type_com$sun$star$sdbc$XPooledConnection,
                        'XPreparedBatchExecution': instance.uno_Type_com$sun$star$sdbc$XPreparedBatchExecution,
                        'XPreparedStatement': instance.uno_Type_com$sun$star$sdbc$XPreparedStatement,
                        'XRef': instance.uno_Type_com$sun$star$sdbc$XRef,
                        'XResultSet': instance.uno_Type_com$sun$star$sdbc$XResultSet,
                        'XResultSetMetaData': instance.uno_Type_com$sun$star$sdbc$XResultSetMetaData,
                        'XResultSetMetaDataSupplier': instance.uno_Type_com$sun$star$sdbc$XResultSetMetaDataSupplier,
                        'XResultSetUpdate': instance.uno_Type_com$sun$star$sdbc$XResultSetUpdate,
                        'XRow': instance.uno_Type_com$sun$star$sdbc$XRow,
                        'XRowSet': instance.uno_Type_com$sun$star$sdbc$XRowSet,
                        'XRowSetListener': instance.uno_Type_com$sun$star$sdbc$XRowSetListener,
                        'XRowUpdate': instance.uno_Type_com$sun$star$sdbc$XRowUpdate,
                        'XSQLData': instance.uno_Type_com$sun$star$sdbc$XSQLData,
                        'XSQLInput': instance.uno_Type_com$sun$star$sdbc$XSQLInput,
                        'XSQLOutput': instance.uno_Type_com$sun$star$sdbc$XSQLOutput,
                        'XStatement': instance.uno_Type_com$sun$star$sdbc$XStatement,
                        'XStruct': instance.uno_Type_com$sun$star$sdbc$XStruct,
                        'XWarningsSupplier': instance.uno_Type_com$sun$star$sdbc$XWarningsSupplier,
                        'BestRowScope': {
                            'SESSION': 2,
                            'TEMPORARY': 0,
                            'TRANSACTION': 1
                        },
                        'BestRowType': {
                            'NOT_PSEUDO': 1,
                            'PSEUDO': 2,
                            'UNKNOWN': 0
                        },
                        'ChangeAction': {
                            'DELETE': 3,
                            'INSERT': 1,
                            'UNDO': 4,
                            'UPDATE': 2
                        },
                        'ColumnSearch': {
                            'BASIC': 2,
                            'CHAR': 1,
                            'FULL': 3,
                            'NONE': 0
                        },
                        'ColumnType': {
                            'NOT_PSEUDO': 1,
                            'PSEUDO': 2,
                            'UNKNOWN': 0
                        },
                        'ColumnValue': {
                            'NO_NULLS': 0,
                            'NULLABLE': 1,
                            'NULLABLE_UNKNOWN': 2
                        },
                        'ConnectionPool': {
                            'create': instance.uno_Function_com$sun$star$sdbc$ConnectionPool$$create
                        },
                        'DataType': {
                            'ARRAY': 2003,
                            'BIGINT': -5,
                            'BINARY': -2,
                            'BIT': -7,
                            'BLOB': 2004,
                            'BOOLEAN': 16,
                            'CHAR': 1,
                            'CLOB': 2005,
                            'DATALINK': 70,
                            'DATE': 91,
                            'DECIMAL': 3,
                            'DISTINCT': 2001,
                            'DOUBLE': 8,
                            'FLOAT': 6,
                            'INTEGER': 4,
                            'LONGNVARCHAR': -16,
                            'LONGVARBINARY': -4,
                            'LONGVARCHAR': -1,
                            'NCHAR': -15,
                            'NCLOB': 2011,
                            'NUMERIC': 2,
                            'NVARCHAR': -9,
                            'OBJECT': 2000,
                            'OTHER': 1111,
                            'REAL': 7,
                            'REF': 2006,
                            'REF_CURSOR': 2012,
                            'ROWID': -8,
                            'SMALLINT': 5,
                            'SQLNULL': 0,
                            'SQLXML': 2009,
                            'STRUCT': 2002,
                            'TIME': 92,
                            'TIMESTAMP': 93,
                            'TIMESTAMP_WITH_TIMEZONE': 2014,
                            'TIME_WITH_TIMEZONE': 2013,
                            'TINYINT': -6,
                            'VARBINARY': -3,
                            'VARCHAR': 12
                        },
                        'Deferrability': {
                            'INITIALLY_DEFERRED': 5,
                            'INITIALLY_IMMEDIATE': 6,
                            'NONE': 7
                        },
                        'DriverManager': {
                            'create': instance.uno_Function_com$sun$star$sdbc$DriverManager$$create
                        },
                        'FetchDirection': {
                            'FORWARD': 1000,
                            'REVERSE': 1001,
                            'UNKNOWN': 1002
                        },
                        'IndexType': {
                            'CLUSTERED': 1,
                            'HASHED': 2,
                            'OTHER': 3,
                            'STATISTIC': 0
                        },
                        'KeyRule': {
                            'CASCADE': 0,
                            'NO_ACTION': 3,
                            'RESTRICT': 1,
                            'SET_DEFAULT': 4,
                            'SET_NULL': 2
                        },
                        'ProcedureColumn': {
                            'IN': 1,
                            'INOUT': 2,
                            'OUT': 4,
                            'RESULT': 3,
                            'RETURN': 5,
                            'UNKNOWN': 0
                        },
                        'ProcedureResult': {
                            'NONE': 1,
                            'RETURN': 2,
                            'UNKNOWN': 0
                        },
                        'ResultSetConcurrency': {
                            'READ_ONLY': 1007,
                            'UPDATABLE': 1008
                        },
                        'ResultSetType': {
                            'FORWARD_ONLY': 1003,
                            'SCROLL_INSENSITIVE': 1004,
                            'SCROLL_SENSITIVE': 1005
                        },
                        'TransactionIsolation': {
                            'NONE': 0,
                            'READ_COMMITTED': 2,
                            'READ_UNCOMMITTED': 1,
                            'REPEATABLE_READ': 4,
                            'SERIALIZABLE': 8
                        }
                    },
                    'sdbcx': {
                        'XAlterTable': instance.uno_Type_com$sun$star$sdbcx$XAlterTable,
                        'XAlterView': instance.uno_Type_com$sun$star$sdbcx$XAlterView,
                        'XAppend': instance.uno_Type_com$sun$star$sdbcx$XAppend,
                        'XAuthorizable': instance.uno_Type_com$sun$star$sdbcx$XAuthorizable,
                        'XColumnsSupplier': instance.uno_Type_com$sun$star$sdbcx$XColumnsSupplier,
                        'XCreateCatalog': instance.uno_Type_com$sun$star$sdbcx$XCreateCatalog,
                        'XDataDefinitionSupplier': instance.uno_Type_com$sun$star$sdbcx$XDataDefinitionSupplier,
                        'XDataDescriptorFactory': instance.uno_Type_com$sun$star$sdbcx$XDataDescriptorFactory,
                        'XDeleteRows': instance.uno_Type_com$sun$star$sdbcx$XDeleteRows,
                        'XDrop': instance.uno_Type_com$sun$star$sdbcx$XDrop,
                        'XDropCatalog': instance.uno_Type_com$sun$star$sdbcx$XDropCatalog,
                        'XGroupsSupplier': instance.uno_Type_com$sun$star$sdbcx$XGroupsSupplier,
                        'XIndexesSupplier': instance.uno_Type_com$sun$star$sdbcx$XIndexesSupplier,
                        'XKeysSupplier': instance.uno_Type_com$sun$star$sdbcx$XKeysSupplier,
                        'XRename': instance.uno_Type_com$sun$star$sdbcx$XRename,
                        'XRowLocate': instance.uno_Type_com$sun$star$sdbcx$XRowLocate,
                        'XTablesSupplier': instance.uno_Type_com$sun$star$sdbcx$XTablesSupplier,
                        'XUser': instance.uno_Type_com$sun$star$sdbcx$XUser,
                        'XUsersSupplier': instance.uno_Type_com$sun$star$sdbcx$XUsersSupplier,
                        'XViewsSupplier': instance.uno_Type_com$sun$star$sdbcx$XViewsSupplier,
                        'CheckOption': {
                            'CASCADE': 2,
                            'LOCAL': 3,
                            'NONE': 0
                        },
                        'CompareBookmark': {
                            'EQUAL': 0,
                            'GREATER': 1,
                            'LESS': -1,
                            'NOT_COMPARABLE': 3,
                            'NOT_EQUAL': 2
                        },
                        'KeyType': {
                            'FOREIGN': 3,
                            'PRIMARY': 1,
                            'UNIQUE': 2
                        },
                        'Privilege': {
                            'ALTER': 64,
                            'CREATE': 32,
                            'DELETE': 8,
                            'DROP': 256,
                            'INSERT': 2,
                            'READ': 16,
                            'REFERENCE': 128,
                            'SELECT': 1,
                            'UPDATE': 4
                        },
                        'PrivilegeObject': {
                            'COLUMN': 2,
                            'TABLE': 0,
                            'VIEW': 1
                        }
                    },
                    'security': {
                        'AccessControlException': instance.uno_Type_com$sun$star$security$AccessControlException,
                        'AllPermission': instance.uno_Type_com$sun$star$security$AllPermission,
                        'RuntimePermission': instance.uno_Type_com$sun$star$security$RuntimePermission,
                        'XAccessControlContext': instance.uno_Type_com$sun$star$security$XAccessControlContext,
                        'XAccessController': instance.uno_Type_com$sun$star$security$XAccessController,
                        'XAction': instance.uno_Type_com$sun$star$security$XAction,
                        'XPolicy': instance.uno_Type_com$sun$star$security$XPolicy,
                        'CertAltNameEntry': instance.uno_Type_com$sun$star$security$CertAltNameEntry,
                        'CertificateContainerStatus': instance.uno_Type_com$sun$star$security$CertificateContainerStatus,
                        'CertificateException': instance.uno_Type_com$sun$star$security$CertificateException,
                        'CertificateKind': instance.uno_Type_com$sun$star$security$CertificateKind,
                        'CryptographyException': instance.uno_Type_com$sun$star$security$CryptographyException,
                        'DocumentSignatureInformation': instance.uno_Type_com$sun$star$security$DocumentSignatureInformation,
                        'EncryptionException': instance.uno_Type_com$sun$star$security$EncryptionException,
                        'ExtAltNameType': instance.uno_Type_com$sun$star$security$ExtAltNameType,
                        'KeyException': instance.uno_Type_com$sun$star$security$KeyException,
                        'NoPasswordException': instance.uno_Type_com$sun$star$security$NoPasswordException,
                        'SecurityInfrastructureException': instance.uno_Type_com$sun$star$security$SecurityInfrastructureException,
                        'SignatureException': instance.uno_Type_com$sun$star$security$SignatureException,
                        'XCertificate': instance.uno_Type_com$sun$star$security$XCertificate,
                        'XCertificateContainer': instance.uno_Type_com$sun$star$security$XCertificateContainer,
                        'XCertificateExtension': instance.uno_Type_com$sun$star$security$XCertificateExtension,
                        'XDocumentDigitalSignatures': instance.uno_Type_com$sun$star$security$XDocumentDigitalSignatures,
                        'XSanExtension': instance.uno_Type_com$sun$star$security$XSanExtension,
                        'AccessController': {
                            'create': instance.uno_Function_com$sun$star$security$AccessController$$create
                        },
                        'CertificateCharacters': {
                            'HAS_PRIVATE_KEY': 4,
                            'SELF_SIGNED': 1
                        },
                        'CertificateContainer': {
                            'create': instance.uno_Function_com$sun$star$security$CertificateContainer$$create
                        },
                        'CertificateValidity': {
                            'CHAIN_INCOMPLETE': 131072,
                            'EXTENSION_INVALID': 128,
                            'EXTENSION_UNKNOWN': 256,
                            'INVALID': 1,
                            'ISSUER_INVALID': 4096,
                            'ISSUER_UNKNOWN': 512,
                            'ISSUER_UNTRUSTED': 1024,
                            'NOT_TIME_NESTED': 8,
                            'REVOKED': 16,
                            'ROOT_INVALID': 65536,
                            'ROOT_UNKNOWN': 8192,
                            'ROOT_UNTRUSTED': 16384,
                            'SIGNATURE_INVALID': 64,
                            'TIME_INVALID': 4,
                            'UNKNOWN_REVOKATION': 32,
                            'UNTRUSTED': 2,
                            'VALID': 0
                        },
                        'DocumentDigitalSignatures': {
                            'createDefault': instance.uno_Function_com$sun$star$security$DocumentDigitalSignatures$$createDefault,
                            'createWithVersion': instance.uno_Function_com$sun$star$security$DocumentDigitalSignatures$$createWithVersion,
                            'createWithVersionAndValidSignature': instance.uno_Function_com$sun$star$security$DocumentDigitalSignatures$$createWithVersionAndValidSignature
                        },
                        'KeyUsage': {
                            'CRL_SIGN': 2,
                            'DATA_ENCIPHERMENT': 16,
                            'DIGITAL_SIGNATURE': 128,
                            'KEY_AGREEMENT': 8,
                            'KEY_CERT_SIGN': 4,
                            'KEY_ENCIPHERMENT': 32,
                            'NON_REPUDIATION': 64
                        },
                        'Policy': {
                            'create': instance.uno_Function_com$sun$star$security$Policy$$create
                        }
                    },
                    'setup': {
                        'UpdateCheck': {
                            'create': instance.uno_Function_com$sun$star$setup$UpdateCheck$$create
                        },
                        'UpdateCheckConfig': {
                            'create': instance.uno_Function_com$sun$star$setup$UpdateCheckConfig$$create
                        }
                    },
                    'sheet': {
                        'ActivationEvent': instance.uno_Type_com$sun$star$sheet$ActivationEvent,
                        'Border': instance.uno_Type_com$sun$star$sheet$Border,
                        'CellDeleteMode': instance.uno_Type_com$sun$star$sheet$CellDeleteMode,
                        'CellInsertMode': instance.uno_Type_com$sun$star$sheet$CellInsertMode,
                        'ComplexReference': instance.uno_Type_com$sun$star$sheet$ComplexReference,
                        'ConditionOperator': instance.uno_Type_com$sun$star$sheet$ConditionOperator,
                        'DDEItemInfo': instance.uno_Type_com$sun$star$sheet$DDEItemInfo,
                        'DDELinkInfo': instance.uno_Type_com$sun$star$sheet$DDELinkInfo,
                        'DDELinkMode': instance.uno_Type_com$sun$star$sheet$DDELinkMode,
                        'DataImportMode': instance.uno_Type_com$sun$star$sheet$DataImportMode,
                        'DataPilotFieldAutoShowInfo': instance.uno_Type_com$sun$star$sheet$DataPilotFieldAutoShowInfo,
                        'DataPilotFieldFilter': instance.uno_Type_com$sun$star$sheet$DataPilotFieldFilter,
                        'DataPilotFieldGroupInfo': instance.uno_Type_com$sun$star$sheet$DataPilotFieldGroupInfo,
                        'DataPilotFieldLayoutInfo': instance.uno_Type_com$sun$star$sheet$DataPilotFieldLayoutInfo,
                        'DataPilotFieldOrientation': instance.uno_Type_com$sun$star$sheet$DataPilotFieldOrientation,
                        'DataPilotFieldReference': instance.uno_Type_com$sun$star$sheet$DataPilotFieldReference,
                        'DataPilotFieldSortInfo': instance.uno_Type_com$sun$star$sheet$DataPilotFieldSortInfo,
                        'DataPilotTableHeaderData': instance.uno_Type_com$sun$star$sheet$DataPilotTableHeaderData,
                        'DataPilotTablePositionData': instance.uno_Type_com$sun$star$sheet$DataPilotTablePositionData,
                        'DataPilotTableResultData': instance.uno_Type_com$sun$star$sheet$DataPilotTableResultData,
                        'DataResult': instance.uno_Type_com$sun$star$sheet$DataResult,
                        'ExternalLinkInfo': instance.uno_Type_com$sun$star$sheet$ExternalLinkInfo,
                        'ExternalReference': instance.uno_Type_com$sun$star$sheet$ExternalReference,
                        'FillDateMode': instance.uno_Type_com$sun$star$sheet$FillDateMode,
                        'FillDirection': instance.uno_Type_com$sun$star$sheet$FillDirection,
                        'FillMode': instance.uno_Type_com$sun$star$sheet$FillMode,
                        'FilterConnection': instance.uno_Type_com$sun$star$sheet$FilterConnection,
                        'FilterFieldValue': instance.uno_Type_com$sun$star$sheet$FilterFieldValue,
                        'FilterOperator': instance.uno_Type_com$sun$star$sheet$FilterOperator,
                        'FormulaOpCodeMapEntry': instance.uno_Type_com$sun$star$sheet$FormulaOpCodeMapEntry,
                        'FormulaToken': instance.uno_Type_com$sun$star$sheet$FormulaToken,
                        'FunctionArgument': instance.uno_Type_com$sun$star$sheet$FunctionArgument,
                        'GeneralFunction': instance.uno_Type_com$sun$star$sheet$GeneralFunction,
                        'GoalResult': instance.uno_Type_com$sun$star$sheet$GoalResult,
                        'LocalizedName': instance.uno_Type_com$sun$star$sheet$LocalizedName,
                        'MemberResult': instance.uno_Type_com$sun$star$sheet$MemberResult,
                        'NameToken': instance.uno_Type_com$sun$star$sheet$NameToken,
                        'NoConvergenceException': instance.uno_Type_com$sun$star$sheet$NoConvergenceException,
                        'PasteOperation': instance.uno_Type_com$sun$star$sheet$PasteOperation,
                        'RangeSelectionEvent': instance.uno_Type_com$sun$star$sheet$RangeSelectionEvent,
                        'ResultEvent': instance.uno_Type_com$sun$star$sheet$ResultEvent,
                        'SheetLinkMode': instance.uno_Type_com$sun$star$sheet$SheetLinkMode,
                        'SingleReference': instance.uno_Type_com$sun$star$sheet$SingleReference,
                        'SolverConstraint': instance.uno_Type_com$sun$star$sheet$SolverConstraint,
                        'SolverConstraintOperator': instance.uno_Type_com$sun$star$sheet$SolverConstraintOperator,
                        'SubTotalColumn': instance.uno_Type_com$sun$star$sheet$SubTotalColumn,
                        'TableFilterField': instance.uno_Type_com$sun$star$sheet$TableFilterField,
                        'TableFilterField2': instance.uno_Type_com$sun$star$sheet$TableFilterField2,
                        'TableFilterField3': instance.uno_Type_com$sun$star$sheet$TableFilterField3,
                        'TableOperationMode': instance.uno_Type_com$sun$star$sheet$TableOperationMode,
                        'TablePageBreakData': instance.uno_Type_com$sun$star$sheet$TablePageBreakData,
                        'ValidationAlertStyle': instance.uno_Type_com$sun$star$sheet$ValidationAlertStyle,
                        'ValidationType': instance.uno_Type_com$sun$star$sheet$ValidationType,
                        'XActivationBroadcaster': instance.uno_Type_com$sun$star$sheet$XActivationBroadcaster,
                        'XActivationEventListener': instance.uno_Type_com$sun$star$sheet$XActivationEventListener,
                        'XAddIn': instance.uno_Type_com$sun$star$sheet$XAddIn,
                        'XAreaLink': instance.uno_Type_com$sun$star$sheet$XAreaLink,
                        'XAreaLinks': instance.uno_Type_com$sun$star$sheet$XAreaLinks,
                        'XArrayFormulaRange': instance.uno_Type_com$sun$star$sheet$XArrayFormulaRange,
                        'XArrayFormulaTokens': instance.uno_Type_com$sun$star$sheet$XArrayFormulaTokens,
                        'XCalculatable': instance.uno_Type_com$sun$star$sheet$XCalculatable,
                        'XCellAddressable': instance.uno_Type_com$sun$star$sheet$XCellAddressable,
                        'XCellFormatRangesSupplier': instance.uno_Type_com$sun$star$sheet$XCellFormatRangesSupplier,
                        'XCellRangeAddressable': instance.uno_Type_com$sun$star$sheet$XCellRangeAddressable,
                        'XCellRangeData': instance.uno_Type_com$sun$star$sheet$XCellRangeData,
                        'XCellRangeFormula': instance.uno_Type_com$sun$star$sheet$XCellRangeFormula,
                        'XCellRangeMovement': instance.uno_Type_com$sun$star$sheet$XCellRangeMovement,
                        'XCellRangeReferrer': instance.uno_Type_com$sun$star$sheet$XCellRangeReferrer,
                        'XCellRangesAccess': instance.uno_Type_com$sun$star$sheet$XCellRangesAccess,
                        'XCellRangesQuery': instance.uno_Type_com$sun$star$sheet$XCellRangesQuery,
                        'XCellSeries': instance.uno_Type_com$sun$star$sheet$XCellSeries,
                        'XColorScaleEntry': instance.uno_Type_com$sun$star$sheet$XColorScaleEntry,
                        'XCompatibilityNames': instance.uno_Type_com$sun$star$sheet$XCompatibilityNames,
                        'XConditionEntry': instance.uno_Type_com$sun$star$sheet$XConditionEntry,
                        'XConditionalFormat': instance.uno_Type_com$sun$star$sheet$XConditionalFormat,
                        'XConditionalFormats': instance.uno_Type_com$sun$star$sheet$XConditionalFormats,
                        'XConsolidatable': instance.uno_Type_com$sun$star$sheet$XConsolidatable,
                        'XConsolidationDescriptor': instance.uno_Type_com$sun$star$sheet$XConsolidationDescriptor,
                        'XDDELink': instance.uno_Type_com$sun$star$sheet$XDDELink,
                        'XDDELinkResults': instance.uno_Type_com$sun$star$sheet$XDDELinkResults,
                        'XDDELinks': instance.uno_Type_com$sun$star$sheet$XDDELinks,
                        'XDataBarEntry': instance.uno_Type_com$sun$star$sheet$XDataBarEntry,
                        'XDataPilotDataLayoutFieldSupplier': instance.uno_Type_com$sun$star$sheet$XDataPilotDataLayoutFieldSupplier,
                        'XDataPilotDescriptor': instance.uno_Type_com$sun$star$sheet$XDataPilotDescriptor,
                        'XDataPilotField': instance.uno_Type_com$sun$star$sheet$XDataPilotField,
                        'XDataPilotFieldGrouping': instance.uno_Type_com$sun$star$sheet$XDataPilotFieldGrouping,
                        'XDataPilotMemberResults': instance.uno_Type_com$sun$star$sheet$XDataPilotMemberResults,
                        'XDataPilotResults': instance.uno_Type_com$sun$star$sheet$XDataPilotResults,
                        'XDataPilotTable': instance.uno_Type_com$sun$star$sheet$XDataPilotTable,
                        'XDataPilotTable2': instance.uno_Type_com$sun$star$sheet$XDataPilotTable2,
                        'XDataPilotTables': instance.uno_Type_com$sun$star$sheet$XDataPilotTables,
                        'XDataPilotTablesSupplier': instance.uno_Type_com$sun$star$sheet$XDataPilotTablesSupplier,
                        'XDatabaseRange': instance.uno_Type_com$sun$star$sheet$XDatabaseRange,
                        'XDatabaseRanges': instance.uno_Type_com$sun$star$sheet$XDatabaseRanges,
                        'XDimensionsSupplier': instance.uno_Type_com$sun$star$sheet$XDimensionsSupplier,
                        'XDocumentAuditing': instance.uno_Type_com$sun$star$sheet$XDocumentAuditing,
                        'XDrillDownDataSupplier': instance.uno_Type_com$sun$star$sheet$XDrillDownDataSupplier,
                        'XEnhancedMouseClickBroadcaster': instance.uno_Type_com$sun$star$sheet$XEnhancedMouseClickBroadcaster,
                        'XExternalDocLink': instance.uno_Type_com$sun$star$sheet$XExternalDocLink,
                        'XExternalDocLinks': instance.uno_Type_com$sun$star$sheet$XExternalDocLinks,
                        'XExternalSheetCache': instance.uno_Type_com$sun$star$sheet$XExternalSheetCache,
                        'XExternalSheetName': instance.uno_Type_com$sun$star$sheet$XExternalSheetName,
                        'XFillAcrossSheet': instance.uno_Type_com$sun$star$sheet$XFillAcrossSheet,
                        'XFilterFormulaParser': instance.uno_Type_com$sun$star$sheet$XFilterFormulaParser,
                        'XFormulaOpCodeMapper': instance.uno_Type_com$sun$star$sheet$XFormulaOpCodeMapper,
                        'XFormulaParser': instance.uno_Type_com$sun$star$sheet$XFormulaParser,
                        'XFormulaQuery': instance.uno_Type_com$sun$star$sheet$XFormulaQuery,
                        'XFormulaTokens': instance.uno_Type_com$sun$star$sheet$XFormulaTokens,
                        'XFunctionAccess': instance.uno_Type_com$sun$star$sheet$XFunctionAccess,
                        'XFunctionDescriptions': instance.uno_Type_com$sun$star$sheet$XFunctionDescriptions,
                        'XGlobalSheetSettings': instance.uno_Type_com$sun$star$sheet$XGlobalSheetSettings,
                        'XGoalSeek': instance.uno_Type_com$sun$star$sheet$XGoalSeek,
                        'XHeaderFooterContent': instance.uno_Type_com$sun$star$sheet$XHeaderFooterContent,
                        'XHierarchiesSupplier': instance.uno_Type_com$sun$star$sheet$XHierarchiesSupplier,
                        'XIconSetEntry': instance.uno_Type_com$sun$star$sheet$XIconSetEntry,
                        'XLabelRange': instance.uno_Type_com$sun$star$sheet$XLabelRange,
                        'XLabelRanges': instance.uno_Type_com$sun$star$sheet$XLabelRanges,
                        'XLevelsSupplier': instance.uno_Type_com$sun$star$sheet$XLevelsSupplier,
                        'XMembersAccess': instance.uno_Type_com$sun$star$sheet$XMembersAccess,
                        'XMembersSupplier': instance.uno_Type_com$sun$star$sheet$XMembersSupplier,
                        'XMultiFormulaTokens': instance.uno_Type_com$sun$star$sheet$XMultiFormulaTokens,
                        'XMultipleOperation': instance.uno_Type_com$sun$star$sheet$XMultipleOperation,
                        'XNamedRange': instance.uno_Type_com$sun$star$sheet$XNamedRange,
                        'XNamedRanges': instance.uno_Type_com$sun$star$sheet$XNamedRanges,
                        'XPrintAreas': instance.uno_Type_com$sun$star$sheet$XPrintAreas,
                        'XRangeSelection': instance.uno_Type_com$sun$star$sheet$XRangeSelection,
                        'XRangeSelectionChangeListener': instance.uno_Type_com$sun$star$sheet$XRangeSelectionChangeListener,
                        'XRangeSelectionListener': instance.uno_Type_com$sun$star$sheet$XRangeSelectionListener,
                        'XRecentFunctions': instance.uno_Type_com$sun$star$sheet$XRecentFunctions,
                        'XResultListener': instance.uno_Type_com$sun$star$sheet$XResultListener,
                        'XScenario': instance.uno_Type_com$sun$star$sheet$XScenario,
                        'XScenarioEnhanced': instance.uno_Type_com$sun$star$sheet$XScenarioEnhanced,
                        'XScenarios': instance.uno_Type_com$sun$star$sheet$XScenarios,
                        'XScenariosSupplier': instance.uno_Type_com$sun$star$sheet$XScenariosSupplier,
                        'XSelectedSheetsSupplier': instance.uno_Type_com$sun$star$sheet$XSelectedSheetsSupplier,
                        'XSheetAnnotation': instance.uno_Type_com$sun$star$sheet$XSheetAnnotation,
                        'XSheetAnnotationAnchor': instance.uno_Type_com$sun$star$sheet$XSheetAnnotationAnchor,
                        'XSheetAnnotationShapeSupplier': instance.uno_Type_com$sun$star$sheet$XSheetAnnotationShapeSupplier,
                        'XSheetAnnotations': instance.uno_Type_com$sun$star$sheet$XSheetAnnotations,
                        'XSheetAnnotationsSupplier': instance.uno_Type_com$sun$star$sheet$XSheetAnnotationsSupplier,
                        'XSheetAuditing': instance.uno_Type_com$sun$star$sheet$XSheetAuditing,
                        'XSheetCellCursor': instance.uno_Type_com$sun$star$sheet$XSheetCellCursor,
                        'XSheetCellRange': instance.uno_Type_com$sun$star$sheet$XSheetCellRange,
                        'XSheetCellRangeContainer': instance.uno_Type_com$sun$star$sheet$XSheetCellRangeContainer,
                        'XSheetCellRanges': instance.uno_Type_com$sun$star$sheet$XSheetCellRanges,
                        'XSheetCondition': instance.uno_Type_com$sun$star$sheet$XSheetCondition,
                        'XSheetCondition2': instance.uno_Type_com$sun$star$sheet$XSheetCondition2,
                        'XSheetConditionalEntries': instance.uno_Type_com$sun$star$sheet$XSheetConditionalEntries,
                        'XSheetConditionalEntry': instance.uno_Type_com$sun$star$sheet$XSheetConditionalEntry,
                        'XSheetFilterDescriptor': instance.uno_Type_com$sun$star$sheet$XSheetFilterDescriptor,
                        'XSheetFilterDescriptor2': instance.uno_Type_com$sun$star$sheet$XSheetFilterDescriptor2,
                        'XSheetFilterDescriptor3': instance.uno_Type_com$sun$star$sheet$XSheetFilterDescriptor3,
                        'XSheetFilterable': instance.uno_Type_com$sun$star$sheet$XSheetFilterable,
                        'XSheetFilterableEx': instance.uno_Type_com$sun$star$sheet$XSheetFilterableEx,
                        'XSheetLinkable': instance.uno_Type_com$sun$star$sheet$XSheetLinkable,
                        'XSheetOperation': instance.uno_Type_com$sun$star$sheet$XSheetOperation,
                        'XSheetOutline': instance.uno_Type_com$sun$star$sheet$XSheetOutline,
                        'XSheetPageBreak': instance.uno_Type_com$sun$star$sheet$XSheetPageBreak,
                        'XSheetPastable': instance.uno_Type_com$sun$star$sheet$XSheetPastable,
                        'XSheetRange': instance.uno_Type_com$sun$star$sheet$XSheetRange,
                        'XSolver': instance.uno_Type_com$sun$star$sheet$XSolver,
                        'XSolverDescription': instance.uno_Type_com$sun$star$sheet$XSolverDescription,
                        'XSpreadsheet': instance.uno_Type_com$sun$star$sheet$XSpreadsheet,
                        'XSpreadsheetDocument': instance.uno_Type_com$sun$star$sheet$XSpreadsheetDocument,
                        'XSpreadsheetView': instance.uno_Type_com$sun$star$sheet$XSpreadsheetView,
                        'XSpreadsheets': instance.uno_Type_com$sun$star$sheet$XSpreadsheets,
                        'XSpreadsheets2': instance.uno_Type_com$sun$star$sheet$XSpreadsheets2,
                        'XSubTotalCalculatable': instance.uno_Type_com$sun$star$sheet$XSubTotalCalculatable,
                        'XSubTotalDescriptor': instance.uno_Type_com$sun$star$sheet$XSubTotalDescriptor,
                        'XSubTotalField': instance.uno_Type_com$sun$star$sheet$XSubTotalField,
                        'XUniqueCellFormatRangesSupplier': instance.uno_Type_com$sun$star$sheet$XUniqueCellFormatRangesSupplier,
                        'XUnnamedDatabaseRanges': instance.uno_Type_com$sun$star$sheet$XUnnamedDatabaseRanges,
                        'XUsedAreaCursor': instance.uno_Type_com$sun$star$sheet$XUsedAreaCursor,
                        'XViewFreezable': instance.uno_Type_com$sun$star$sheet$XViewFreezable,
                        'XViewPane': instance.uno_Type_com$sun$star$sheet$XViewPane,
                        'XViewPanesSupplier': instance.uno_Type_com$sun$star$sheet$XViewPanesSupplier,
                        'XViewSplitable': instance.uno_Type_com$sun$star$sheet$XViewSplitable,
                        'XVolatileResult': instance.uno_Type_com$sun$star$sheet$XVolatileResult,
                        'AddressConvention': {
                            'LOTUS_A1': 4,
                            'OOO': 0,
                            'UNSPECIFIED': -1,
                            'XL_A1': 1,
                            'XL_OOX': 3,
                            'XL_R1C1': 2
                        },
                        'CellFlags': {
                            'ANNOTATION': 8,
                            'DATETIME': 2,
                            'EDITATTR': 256,
                            'FORMATTED': 512,
                            'FORMULA': 16,
                            'HARDATTR': 32,
                            'OBJECTS': 128,
                            'STRING': 4,
                            'STYLES': 64,
                            'VALUE': 1
                        },
                        'ColorScaleEntryType': {
                            'COLORSCALE_FORMULA': 5,
                            'COLORSCALE_MAX': 1,
                            'COLORSCALE_MIN': 0,
                            'COLORSCALE_PERCENT': 4,
                            'COLORSCALE_PERCENTILE': 2,
                            'COLORSCALE_VALUE': 3
                        },
                        'ConditionEntryType': {
                            'COLORSCALE': 1,
                            'CONDITION': 0,
                            'DATABAR': 2,
                            'DATE': 4,
                            'ICONSET': 3
                        },
                        'ConditionFormatOperator': {
                            'ABOVE_AVERAGE': 14,
                            'ABOVE_EQUAL_AVERAGE': 16,
                            'BEGINS_WITH': 20,
                            'BELOW_AVERAGE': 15,
                            'BELOW_EQUAL_AVERAGE': 17,
                            'BETWEEN': 6,
                            'BOTTOM_N_ELEMENTS': 11,
                            'BOTTOM_N_PERCENT': 13,
                            'CONTAINS': 22,
                            'DUPLICATE': 8,
                            'ENDS_WITH': 21,
                            'EQUAL': 0,
                            'ERROR': 18,
                            'EXPRESSION': 24,
                            'GREATER': 2,
                            'GREATER_EQUAL': 4,
                            'LESS': 1,
                            'LESS_EQUAL': 3,
                            'NOT_BETWEEN': 7,
                            'NOT_CONTAINS': 23,
                            'NOT_EQUAL': 5,
                            'NO_ERROR': 19,
                            'TOP_N_ELEMENTS': 10,
                            'TOP_N_PERCENT': 12,
                            'UNIQUE': 9
                        },
                        'ConditionOperator2': {
                            'BETWEEN': 7,
                            'DUPLICATE': 10,
                            'EQUAL': 1,
                            'FORMULA': 9,
                            'GREATER': 3,
                            'GREATER_EQUAL': 4,
                            'LESS': 5,
                            'LESS_EQUAL': 6,
                            'NONE': 0,
                            'NOT_BETWEEN': 8,
                            'NOT_DUPLICATE': 11,
                            'NOT_EQUAL': 2
                        },
                        'CreateDialogFactoryService': {
                            'create': instance.uno_Function_com$sun$star$sheet$CreateDialogFactoryService$$create
                        },
                        'DataBarAxis': {
                            'AXIS_AUTOMATIC': 2,
                            'AXIS_MIDDLE': 1,
                            'AXIS_NONE': 0
                        },
                        'DataBarEntryType': {
                            'DATABAR_AUTO': 1,
                            'DATABAR_FORMULA': 6,
                            'DATABAR_MAX': 2,
                            'DATABAR_MIN': 1,
                            'DATABAR_PERCENT': 5,
                            'DATABAR_PERCENTILE': 3,
                            'DATABAR_VALUE': 4
                        },
                        'DataPilotFieldGroupBy': {
                            'DAYS': 8,
                            'HOURS': 4,
                            'MINUTES': 2,
                            'MONTHS': 16,
                            'QUARTERS': 32,
                            'SECONDS': 1,
                            'YEARS': 64
                        },
                        'DataPilotFieldLayoutMode': {
                            'COMPACT_LAYOUT': 3,
                            'OUTLINE_SUBTOTALS_BOTTOM': 2,
                            'OUTLINE_SUBTOTALS_TOP': 1,
                            'TABULAR_LAYOUT': 0
                        },
                        'DataPilotFieldReferenceItemType': {
                            'NAMED': 0,
                            'NEXT': 2,
                            'PREVIOUS': 1
                        },
                        'DataPilotFieldReferenceType': {
                            'COLUMN_PERCENTAGE': 6,
                            'INDEX': 8,
                            'ITEM_DIFFERENCE': 1,
                            'ITEM_PERCENTAGE': 2,
                            'ITEM_PERCENTAGE_DIFFERENCE': 3,
                            'NONE': 0,
                            'ROW_PERCENTAGE': 5,
                            'RUNNING_TOTAL': 4,
                            'TOTAL_PERCENTAGE': 7
                        },
                        'DataPilotFieldShowItemsMode': {
                            'FROM_BOTTOM': 1,
                            'FROM_TOP': 0
                        },
                        'DataPilotFieldSortMode': {
                            'DATA': 3,
                            'MANUAL': 1,
                            'NAME': 2,
                            'NONE': 0
                        },
                        'DataPilotOutputRangeType': {
                            'RESULT': 2,
                            'TABLE': 1,
                            'WHOLE': 0
                        },
                        'DataPilotTablePositionType': {
                            'COLUMN_HEADER': 3,
                            'NOT_IN_TABLE': 0,
                            'OTHER': 4,
                            'RESULT': 1,
                            'ROW_HEADER': 2
                        },
                        'DataResultFlags': {
                            'ERROR': 4,
                            'HASDATA': 1,
                            'SUBTOTAL': 2
                        },
                        'DateType': {
                            'LAST7DAYS': 3,
                            'LASTMONTH': 8,
                            'LASTWEEK': 5,
                            'LASTYEAR': 11,
                            'NEXTMONTH': 9,
                            'NEXTWEEK': 6,
                            'NEXTYEAR': 12,
                            'THISMONTH': 7,
                            'THISWEEK': 4,
                            'THISYEAR': 10,
                            'TODAY': 0,
                            'TOMORROW': 2,
                            'YESTERDAY': 1
                        },
                        'DimensionFlags': {
                            'NO_COLUMN_ORIENTATION': 1,
                            'NO_DATA_ORIENTATION': 8,
                            'NO_PAGE_ORIENTATION': 4,
                            'NO_ROW_ORIENTATION': 2
                        },
                        'ExternalLinkType': {
                            'DDE': 2,
                            'DOCUMENT': 1,
                            'SELF': 3,
                            'SPECIAL': 4,
                            'UNKNOWN': 0
                        },
                        'FilterFieldType': {
                            'BACKGROUND_COLOR': 4,
                            'DATE': 2,
                            'NUMERIC': 0,
                            'STRING': 1,
                            'TEXT_COLOR': 3
                        },
                        'FilterOperator2': {
                            'BEGINS_WITH': 14,
                            'BOTTOM_PERCENT': 11,
                            'BOTTOM_VALUES': 10,
                            'CONTAINS': 12,
                            'DOES_NOT_BEGIN_WITH': 15,
                            'DOES_NOT_CONTAIN': 13,
                            'DOES_NOT_END_WITH': 17,
                            'EMPTY': 0,
                            'ENDS_WITH': 16,
                            'EQUAL': 2,
                            'GREATER': 4,
                            'GREATER_EQUAL': 5,
                            'LESS': 6,
                            'LESS_EQUAL': 7,
                            'NOT_EMPTY': 1,
                            'NOT_EQUAL': 3,
                            'TOP_PERCENT': 9,
                            'TOP_VALUES': 8
                        },
                        'FormulaLanguage': {
                            'API': 6,
                            'ENGLISH': 2,
                            'NATIVE': 3,
                            'ODFF': 0,
                            'ODF_11': 1,
                            'OOXML': 5,
                            'XL_ENGLISH': 4
                        },
                        'FormulaMapGroup': {
                            'ALL_EXCEPT_SPECIAL': 2147483647,
                            'ARRAY_SEPARATORS': 2,
                            'BINARY_OPERATORS': 8,
                            'FUNCTIONS': 16,
                            'SEPARATORS': 1,
                            'SPECIAL': 0,
                            'UNARY_OPERATORS': 4
                        },
                        'FormulaMapGroupSpecialOffset': {
                            'BAD': 7,
                            'CALL': 1,
                            'COL_ROW_NAME': 12,
                            'DB_AREA': 10,
                            'EXTERNAL': 3,
                            'MACRO': 11,
                            'MAT_REF': 9,
                            'MISSING': 6,
                            'NAME': 4,
                            'NO_NAME': 5,
                            'PUSH': 0,
                            'SPACES': 8,
                            'STOP': 2,
                            'WHITESPACE': 13
                        },
                        'FormulaOpCodeMapper': {
                            'create': instance.uno_Function_com$sun$star$sheet$FormulaOpCodeMapper$$create
                        },
                        'FormulaResult': {
                            'ERROR': 4,
                            'STRING': 2,
                            'VALUE': 1
                        },
                        'FunctionCategory': {
                            'ADDIN': 11,
                            'DATABASE': 1,
                            'DATETIME': 2,
                            'FINANCIAL': 3,
                            'INFORMATION': 4,
                            'LOGICAL': 5,
                            'MATHEMATICAL': 6,
                            'MATRIX': 7,
                            'SPREADSHEET': 9,
                            'STATISTICAL': 8,
                            'TEXT': 10
                        },
                        'GeneralFunction2': {
                            'AUTO': 1,
                            'AVERAGE': 4,
                            'COUNT': 3,
                            'COUNTNUMS': 8,
                            'MAX': 5,
                            'MEDIAN': 13,
                            'MIN': 6,
                            'NONE': 0,
                            'PRODUCT': 7,
                            'STDEV': 9,
                            'STDEVP': 10,
                            'SUM': 2,
                            'VAR': 11,
                            'VARP': 12
                        },
                        'GlobalSheetSettings': {
                            'create': instance.uno_Function_com$sun$star$sheet$GlobalSheetSettings$$create
                        },
                        'IconSetFormatEntry': {
                            'ICONSET_FORMULA': 4,
                            'ICONSET_MIN': 0,
                            'ICONSET_PERCENT': 3,
                            'ICONSET_PERCENTILE': 1,
                            'ICONSET_VALUE': 2
                        },
                        'IconSetType': {
                            'ICONSET_3ARROWS': 0,
                            'ICONSET_3ARROWS_GRAY': 1,
                            'ICONSET_3COLOR_SIMILIES': 9,
                            'ICONSET_3FLAGS': 2,
                            'ICONSET_3SIGNS': 5,
                            'ICONSET_3SMILIES': 8,
                            'ICONSET_3SYMBOLS': 6,
                            'ICONSET_3SYMBOLS2': 7,
                            'ICONSET_3TRAFFICLIGHTS1': 3,
                            'ICONSET_3TRAFFICLIGHTS2': 4,
                            'ICONSET_4ARROWS': 10,
                            'ICONSET_4ARROWS_GRAY': 11,
                            'ICONSET_4RATING': 13,
                            'ICONSET_4RED_TO_BLACK': 12,
                            'ICONSET_4TRAFFICLIGHTS': 14,
                            'ICONSET_5ARROWS': 15,
                            'ICONSET_5ARROWS_GRAY': 16,
                            'ICONSET_5QUARTERS': 18,
                            'ICONSET_5RATINGS': 17
                        },
                        'MemberResultFlags': {
                            'CONTINUE': 4,
                            'GRANDTOTAL': 8,
                            'HASMEMBER': 1,
                            'NUMERIC': 16,
                            'SUBTOTAL': 2
                        },
                        'MoveDirection': {
                            'DOWN': 0,
                            'LEFT': 3,
                            'RIGHT': 1,
                            'UP': 2
                        },
                        'NamedRangeFlag': {
                            'COLUMN_HEADER': 4,
                            'FILTER_CRITERIA': 1,
                            'HIDDEN': 16,
                            'PRINT_AREA': 2,
                            'ROW_HEADER': 8
                        },
                        'RecentFunctions': {
                            'create': instance.uno_Function_com$sun$star$sheet$RecentFunctions$$create
                        },
                        'ReferenceFlags': {
                            'COLUMN_DELETED': 2,
                            'COLUMN_RELATIVE': 1,
                            'RELATIVE_NAME': 128,
                            'ROW_DELETED': 8,
                            'ROW_RELATIVE': 4,
                            'SHEET_3D': 64,
                            'SHEET_DELETED': 32,
                            'SHEET_RELATIVE': 16
                        },
                        'Solver': {
                            'create': instance.uno_Function_com$sun$star$sheet$Solver$$create
                        },
                        'SpreadsheetViewObjectsMode': {
                            'HIDE': 1,
                            'SHOW': 0
                        },
                        'StatusBarFunction': {
                            'AVERAGE': 1,
                            'COUNT': 3,
                            'COUNTNUMS': 2,
                            'MAX': 4,
                            'MIN': 5,
                            'NONE': 0,
                            'SUM': 9
                        },
                        'TableValidationVisibility': {
                            'INVISIBLE': 0,
                            'SORTEDASCENDING': 2,
                            'UNSORTED': 1
                        },
                        'opencl': {
                            'OpenCLDevice': instance.uno_Type_com$sun$star$sheet$opencl$OpenCLDevice,
                            'OpenCLPlatform': instance.uno_Type_com$sun$star$sheet$opencl$OpenCLPlatform,
                            'XOpenCLSelection': instance.uno_Type_com$sun$star$sheet$opencl$XOpenCLSelection
                        }
                    },
                    'smarttags': {
                        'SmartTagRecognizerMode': instance.uno_Type_com$sun$star$smarttags$SmartTagRecognizerMode,
                        'XRangeBasedSmartTagRecognizer': instance.uno_Type_com$sun$star$smarttags$XRangeBasedSmartTagRecognizer,
                        'XSmartTagAction': instance.uno_Type_com$sun$star$smarttags$XSmartTagAction,
                        'XSmartTagRecognizer': instance.uno_Type_com$sun$star$smarttags$XSmartTagRecognizer
                    },
                    'style': {
                        'BreakType': instance.uno_Type_com$sun$star$style$BreakType,
                        'DropCapFormat': instance.uno_Type_com$sun$star$style$DropCapFormat,
                        'GraphicLocation': instance.uno_Type_com$sun$star$style$GraphicLocation,
                        'HorizontalAlignment': instance.uno_Type_com$sun$star$style$HorizontalAlignment,
                        'LineSpacing': instance.uno_Type_com$sun$star$style$LineSpacing,
                        'PageStyleLayout': instance.uno_Type_com$sun$star$style$PageStyleLayout,
                        'ParagraphAdjust': instance.uno_Type_com$sun$star$style$ParagraphAdjust,
                        'TabAlign': instance.uno_Type_com$sun$star$style$TabAlign,
                        'TabStop': instance.uno_Type_com$sun$star$style$TabStop,
                        'VerticalAlignment': instance.uno_Type_com$sun$star$style$VerticalAlignment,
                        'XAutoStyle': instance.uno_Type_com$sun$star$style$XAutoStyle,
                        'XAutoStyleFamily': instance.uno_Type_com$sun$star$style$XAutoStyleFamily,
                        'XAutoStyles': instance.uno_Type_com$sun$star$style$XAutoStyles,
                        'XAutoStylesSupplier': instance.uno_Type_com$sun$star$style$XAutoStylesSupplier,
                        'XDefaultsSupplier': instance.uno_Type_com$sun$star$style$XDefaultsSupplier,
                        'XStyle': instance.uno_Type_com$sun$star$style$XStyle,
                        'XStyleFamiliesSupplier': instance.uno_Type_com$sun$star$style$XStyleFamiliesSupplier,
                        'XStyleLoader': instance.uno_Type_com$sun$star$style$XStyleLoader,
                        'XStyleLoader2': instance.uno_Type_com$sun$star$style$XStyleLoader2,
                        'XStyleSupplier': instance.uno_Type_com$sun$star$style$XStyleSupplier,
                        'CaseMap': {
                            'LOWERCASE': 2,
                            'NONE': 0,
                            'SMALLCAPS': 4,
                            'TITLE': 3,
                            'UPPERCASE': 1
                        },
                        'FootnoteLineStyle': {
                            'DASHED': 3,
                            'DOTTED': 2,
                            'NONE': 0,
                            'SOLID': 1
                        },
                        'LineNumberPosition': {
                            'INSIDE': 2,
                            'LEFT': 0,
                            'OUTSIDE': 3,
                            'RIGHT': 1
                        },
                        'LineSpacingMode': {
                            'FIX': 3,
                            'LEADING': 2,
                            'MINIMUM': 1,
                            'PROP': 0
                        },
                        'NumberingType': {
                            'AIU_FULLWIDTH_JA': 21,
                            'AIU_HALFWIDTH_JA': 22,
                            'ARABIC': 4,
                            'ARABIC_ZERO': 64,
                            'ARABIC_ZERO3': 65,
                            'ARABIC_ZERO4': 66,
                            'ARABIC_ZERO5': 67,
                            'BITMAP': 8,
                            'CHARS_ARABIC': 31,
                            'CHARS_ARABIC_ABJAD': 54,
                            'CHARS_CYRILLIC_LOWER_LETTER_BG': 39,
                            'CHARS_CYRILLIC_LOWER_LETTER_N_BG': 41,
                            'CHARS_CYRILLIC_LOWER_LETTER_N_RU': 45,
                            'CHARS_CYRILLIC_LOWER_LETTER_N_SR': 51,
                            'CHARS_CYRILLIC_LOWER_LETTER_N_UK': 75,
                            'CHARS_CYRILLIC_LOWER_LETTER_RU': 43,
                            'CHARS_CYRILLIC_LOWER_LETTER_SR': 49,
                            'CHARS_CYRILLIC_LOWER_LETTER_UK': 73,
                            'CHARS_CYRILLIC_UPPER_LETTER_BG': 38,
                            'CHARS_CYRILLIC_UPPER_LETTER_N_BG': 40,
                            'CHARS_CYRILLIC_UPPER_LETTER_N_RU': 44,
                            'CHARS_CYRILLIC_UPPER_LETTER_N_SR': 50,
                            'CHARS_CYRILLIC_UPPER_LETTER_N_UK': 74,
                            'CHARS_CYRILLIC_UPPER_LETTER_RU': 42,
                            'CHARS_CYRILLIC_UPPER_LETTER_SR': 48,
                            'CHARS_CYRILLIC_UPPER_LETTER_UK': 72,
                            'CHARS_GREEK_LOWER_LETTER': 53,
                            'CHARS_GREEK_UPPER_LETTER': 52,
                            'CHARS_HEBREW': 33,
                            'CHARS_KHMER': 35,
                            'CHARS_LAO': 36,
                            'CHARS_LOWER_LETTER': 1,
                            'CHARS_LOWER_LETTER_N': 10,
                            'CHARS_MYANMAR': 47,
                            'CHARS_NEPALI': 34,
                            'CHARS_PERSIAN': 46,
                            'CHARS_PERSIAN_WORD': 55,
                            'CHARS_THAI': 32,
                            'CHARS_TIBETAN': 37,
                            'CHARS_UPPER_LETTER': 0,
                            'CHARS_UPPER_LETTER_N': 9,
                            'CHAR_SPECIAL': 6,
                            'CIRCLE_NUMBER': 14,
                            'DI_ZI_ZH': 19,
                            'FULLWIDTH_ARABIC': 13,
                            'HANGUL_CIRCLED_JAMO_KO': 29,
                            'HANGUL_CIRCLED_SYLLABLE_KO': 30,
                            'HANGUL_JAMO_KO': 27,
                            'HANGUL_SYLLABLE_KO': 28,
                            'IROHA_FULLWIDTH_JA': 23,
                            'IROHA_HALFWIDTH_JA': 24,
                            'NATIVE_NUMBERING': 12,
                            'NUMBER_ARABIC_INDIC': 57,
                            'NUMBER_DIGITAL2_KO': 70,
                            'NUMBER_DIGITAL_KO': 69,
                            'NUMBER_EAST_ARABIC_INDIC': 58,
                            'NUMBER_HANGUL_KO': 26,
                            'NUMBER_HEBREW': 56,
                            'NUMBER_INDIC_DEVANAGARI': 59,
                            'NUMBER_LEGAL_KO': 71,
                            'NUMBER_LOWER_ZH': 15,
                            'NUMBER_NONE': 5,
                            'NUMBER_TRADITIONAL_JA': 20,
                            'NUMBER_UPPER_KO': 25,
                            'NUMBER_UPPER_ZH': 16,
                            'NUMBER_UPPER_ZH_TW': 17,
                            'PAGE_DESCRIPTOR': 7,
                            'ROMAN_LOWER': 3,
                            'ROMAN_UPPER': 2,
                            'SYMBOL_CHICAGO': 63,
                            'SZEKELY_ROVAS': 68,
                            'TEXT_CARDINAL': 61,
                            'TEXT_NUMBER': 60,
                            'TEXT_ORDINAL': 62,
                            'TIAN_GAN_ZH': 18,
                            'TRANSLITERATION': 11
                        },
                        'ParagraphStyleCategory': {
                            'CHAPTER': 1,
                            'EXTRA': 4,
                            'HTML': 5,
                            'INDEX': 3,
                            'LIST': 2,
                            'TEXT': 0
                        }
                    },
                    'svg': {
                        'XSVGPrinter': instance.uno_Type_com$sun$star$svg$XSVGPrinter,
                        'XSVGWriter': instance.uno_Type_com$sun$star$svg$XSVGWriter
                    },
                    'system': {
                        'SystemShellExecuteException': instance.uno_Type_com$sun$star$system$SystemShellExecuteException,
                        'XSimpleMailClient': instance.uno_Type_com$sun$star$system$XSimpleMailClient,
                        'XSimpleMailClientSupplier': instance.uno_Type_com$sun$star$system$XSimpleMailClientSupplier,
                        'XSimpleMailMessage': instance.uno_Type_com$sun$star$system$XSimpleMailMessage,
                        'XSimpleMailMessage2': instance.uno_Type_com$sun$star$system$XSimpleMailMessage2,
                        'XSystemShellExecute': instance.uno_Type_com$sun$star$system$XSystemShellExecute,
                        'SimpleCommandMail': {
                            'create': instance.uno_Function_com$sun$star$system$SimpleCommandMail$$create
                        },
                        'SimpleMailClientFlags': {
                            'DEFAULTS': 0,
                            'NO_LOGON_DIALOG': 2,
                            'NO_USER_INTERFACE': 1
                        },
                        'SimpleSystemMail': {
                            'create': instance.uno_Function_com$sun$star$system$SimpleSystemMail$$create
                        },
                        'SystemShellExecute': {
                            'create': instance.uno_Function_com$sun$star$system$SystemShellExecute$$create
                        },
                        'SystemShellExecuteFlags': {
                            'DEFAULTS': 0,
                            'NO_SYSTEM_ERROR_MESSAGE': 1,
                            'URIS_ONLY': 2
                        },
                        'windows': {
                            'JumpListItem': instance.uno_Type_com$sun$star$system$windows$JumpListItem,
                            'XJumpList': instance.uno_Type_com$sun$star$system$windows$XJumpList,
                            'JumpList': {
                                'create': instance.uno_Function_com$sun$star$system$windows$JumpList$$create
                            }
                        }
                    },
                    'table': {
                        'BorderLine': instance.uno_Type_com$sun$star$table$BorderLine,
                        'BorderLine2': instance.uno_Type_com$sun$star$table$BorderLine2,
                        'CellAddress': instance.uno_Type_com$sun$star$table$CellAddress,
                        'CellContentType': instance.uno_Type_com$sun$star$table$CellContentType,
                        'CellHoriJustify': instance.uno_Type_com$sun$star$table$CellHoriJustify,
                        'CellOrientation': instance.uno_Type_com$sun$star$table$CellOrientation,
                        'CellRangeAddress': instance.uno_Type_com$sun$star$table$CellRangeAddress,
                        'CellVertJustify': instance.uno_Type_com$sun$star$table$CellVertJustify,
                        'ShadowFormat': instance.uno_Type_com$sun$star$table$ShadowFormat,
                        'ShadowLocation': instance.uno_Type_com$sun$star$table$ShadowLocation,
                        'TableBorder': instance.uno_Type_com$sun$star$table$TableBorder,
                        'TableBorder2': instance.uno_Type_com$sun$star$table$TableBorder2,
                        'TableBorderDistances': instance.uno_Type_com$sun$star$table$TableBorderDistances,
                        'TableOrientation': instance.uno_Type_com$sun$star$table$TableOrientation,
                        'TableSortField': instance.uno_Type_com$sun$star$table$TableSortField,
                        'TableSortFieldType': instance.uno_Type_com$sun$star$table$TableSortFieldType,
                        'XAutoFormattable': instance.uno_Type_com$sun$star$table$XAutoFormattable,
                        'XCell': instance.uno_Type_com$sun$star$table$XCell,
                        'XCell2': instance.uno_Type_com$sun$star$table$XCell2,
                        'XCellCursor': instance.uno_Type_com$sun$star$table$XCellCursor,
                        'XCellRange': instance.uno_Type_com$sun$star$table$XCellRange,
                        'XColumnRowRange': instance.uno_Type_com$sun$star$table$XColumnRowRange,
                        'XMergeableCell': instance.uno_Type_com$sun$star$table$XMergeableCell,
                        'XMergeableCellRange': instance.uno_Type_com$sun$star$table$XMergeableCellRange,
                        'XTable': instance.uno_Type_com$sun$star$table$XTable,
                        'XTableChart': instance.uno_Type_com$sun$star$table$XTableChart,
                        'XTableCharts': instance.uno_Type_com$sun$star$table$XTableCharts,
                        'XTableChartsSupplier': instance.uno_Type_com$sun$star$table$XTableChartsSupplier,
                        'XTableColumns': instance.uno_Type_com$sun$star$table$XTableColumns,
                        'XTablePivotChart': instance.uno_Type_com$sun$star$table$XTablePivotChart,
                        'XTablePivotCharts': instance.uno_Type_com$sun$star$table$XTablePivotCharts,
                        'XTablePivotChartsSupplier': instance.uno_Type_com$sun$star$table$XTablePivotChartsSupplier,
                        'XTableRows': instance.uno_Type_com$sun$star$table$XTableRows,
                        'BorderLineStyle': {
                            'BORDER_LINE_STYLE_MAX': 17,
                            'DASHED': 2,
                            'DASH_DOT': 16,
                            'DASH_DOT_DOT': 17,
                            'DOTTED': 1,
                            'DOUBLE': 3,
                            'DOUBLE_THIN': 15,
                            'EMBOSSED': 10,
                            'ENGRAVED': 11,
                            'FINE_DASHED': 14,
                            'INSET': 13,
                            'NONE': 32767,
                            'OUTSET': 12,
                            'SOLID': 0,
                            'THICKTHIN_LARGEGAP': 9,
                            'THICKTHIN_MEDIUMGAP': 8,
                            'THICKTHIN_SMALLGAP': 7,
                            'THINTHICK_LARGEGAP': 6,
                            'THINTHICK_MEDIUMGAP': 5,
                            'THINTHICK_SMALLGAP': 4
                        },
                        'CellJustifyMethod': {
                            'AUTO': 0,
                            'DISTRIBUTE': 1
                        },
                        'CellVertJustify2': {
                            'BLOCK': 4,
                            'BOTTOM': 3,
                            'CENTER': 2,
                            'STANDARD': 0,
                            'TOP': 1
                        }
                    },
                    'task': {
                        'XInteractionAbort': instance.uno_Type_com$sun$star$task$XInteractionAbort,
                        'XInteractionContinuation': instance.uno_Type_com$sun$star$task$XInteractionContinuation,
                        'XInteractionHandler': instance.uno_Type_com$sun$star$task$XInteractionHandler,
                        'XInteractionHandler2': instance.uno_Type_com$sun$star$task$XInteractionHandler2,
                        'XInteractionRequest': instance.uno_Type_com$sun$star$task$XInteractionRequest,
                        'XInteractionRetry': instance.uno_Type_com$sun$star$task$XInteractionRetry,
                        'ClassifiedInteractionRequest': instance.uno_Type_com$sun$star$task$ClassifiedInteractionRequest,
                        'DocumentMSPasswordRequest': instance.uno_Type_com$sun$star$task$DocumentMSPasswordRequest,
                        'DocumentMSPasswordRequest2': instance.uno_Type_com$sun$star$task$DocumentMSPasswordRequest2,
                        'DocumentMacroConfirmationRequest': instance.uno_Type_com$sun$star$task$DocumentMacroConfirmationRequest,
                        'DocumentPasswordRequest': instance.uno_Type_com$sun$star$task$DocumentPasswordRequest,
                        'DocumentPasswordRequest2': instance.uno_Type_com$sun$star$task$DocumentPasswordRequest2,
                        'ErrorCodeIOException': instance.uno_Type_com$sun$star$task$ErrorCodeIOException,
                        'ErrorCodeRequest': instance.uno_Type_com$sun$star$task$ErrorCodeRequest,
                        'ErrorCodeRequest2': instance.uno_Type_com$sun$star$task$ErrorCodeRequest2,
                        'InteractionClassification': instance.uno_Type_com$sun$star$task$InteractionClassification,
                        'MasterPasswordRequest': instance.uno_Type_com$sun$star$task$MasterPasswordRequest,
                        'NoMasterException': instance.uno_Type_com$sun$star$task$NoMasterException,
                        'OfficeRestartManager': instance.uno_Function_com$sun$star$task$OfficeRestartManager,
                        'PDFExportException': instance.uno_Type_com$sun$star$task$PDFExportException,
                        'PasswordRequest': instance.uno_Type_com$sun$star$task$PasswordRequest,
                        'PasswordRequestMode': instance.uno_Type_com$sun$star$task$PasswordRequestMode,
                        'UnsupportedOverwriteRequest': instance.uno_Type_com$sun$star$task$UnsupportedOverwriteRequest,
                        'UrlRecord': instance.uno_Type_com$sun$star$task$UrlRecord,
                        'UserRecord': instance.uno_Type_com$sun$star$task$UserRecord,
                        'XAbortChannel': instance.uno_Type_com$sun$star$task$XAbortChannel,
                        'XAsyncJob': instance.uno_Type_com$sun$star$task$XAsyncJob,
                        'XInteractionApprove': instance.uno_Type_com$sun$star$task$XInteractionApprove,
                        'XInteractionAskLater': instance.uno_Type_com$sun$star$task$XInteractionAskLater,
                        'XInteractionDisapprove': instance.uno_Type_com$sun$star$task$XInteractionDisapprove,
                        'XInteractionPassword': instance.uno_Type_com$sun$star$task$XInteractionPassword,
                        'XInteractionPassword2': instance.uno_Type_com$sun$star$task$XInteractionPassword2,
                        'XInteractionRequestStringResolver': instance.uno_Type_com$sun$star$task$XInteractionRequestStringResolver,
                        'XJob': instance.uno_Type_com$sun$star$task$XJob,
                        'XJobExecutor': instance.uno_Type_com$sun$star$task$XJobExecutor,
                        'XJobListener': instance.uno_Type_com$sun$star$task$XJobListener,
                        'XMasterPasswordHandling': instance.uno_Type_com$sun$star$task$XMasterPasswordHandling,
                        'XMasterPasswordHandling2': instance.uno_Type_com$sun$star$task$XMasterPasswordHandling2,
                        'XPasswordContainer': instance.uno_Type_com$sun$star$task$XPasswordContainer,
                        'XPasswordContainer2': instance.uno_Type_com$sun$star$task$XPasswordContainer2,
                        'XRestartManager': instance.uno_Type_com$sun$star$task$XRestartManager,
                        'XStatusIndicator': instance.uno_Type_com$sun$star$task$XStatusIndicator,
                        'XStatusIndicatorFactory': instance.uno_Type_com$sun$star$task$XStatusIndicatorFactory,
                        'XStatusIndicatorSupplier': instance.uno_Type_com$sun$star$task$XStatusIndicatorSupplier,
                        'XUrlContainer': instance.uno_Type_com$sun$star$task$XUrlContainer,
                        'theJobExecutor': instance.uno_Function_com$sun$star$task$theJobExecutor,
                        'InteractionHandler': {
                            'createWithParent': instance.uno_Function_com$sun$star$task$InteractionHandler$$createWithParent,
                            'createWithParentAndContext': instance.uno_Function_com$sun$star$task$InteractionHandler$$createWithParentAndContext
                        },
                        'InteractionRequestStringResolver': {
                            'create': instance.uno_Function_com$sun$star$task$InteractionRequestStringResolver$$create
                        },
                        'JobExecutor': {
                            'create': instance.uno_Function_com$sun$star$task$JobExecutor$$create
                        },
                        'PasswordContainer': {
                            'create': instance.uno_Function_com$sun$star$task$PasswordContainer$$create
                        },
                        'PasswordContainerInteractionHandler': {
                            'create': instance.uno_Function_com$sun$star$task$PasswordContainerInteractionHandler$$create
                        },
                        'StatusIndicatorFactory': {
                            'createWithFrame': instance.uno_Function_com$sun$star$task$StatusIndicatorFactory$$createWithFrame,
                            'createWithWindow': instance.uno_Function_com$sun$star$task$StatusIndicatorFactory$$createWithWindow
                        }
                    },
                    'text': {
                        'GraphicCrop': instance.uno_Type_com$sun$star$text$GraphicCrop,
                        'HoriOrientationFormat': instance.uno_Type_com$sun$star$text$HoriOrientationFormat,
                        'HorizontalAdjust': instance.uno_Type_com$sun$star$text$HorizontalAdjust,
                        'InvalidTextContentException': instance.uno_Type_com$sun$star$text$InvalidTextContentException,
                        'MailMergeEvent': instance.uno_Type_com$sun$star$text$MailMergeEvent,
                        'NotePrintMode': instance.uno_Type_com$sun$star$text$NotePrintMode,
                        'PageNumberType': instance.uno_Type_com$sun$star$text$PageNumberType,
                        'RubyAdjust': instance.uno_Type_com$sun$star$text$RubyAdjust,
                        'SectionFileLink': instance.uno_Type_com$sun$star$text$SectionFileLink,
                        'TableColumnSeparator': instance.uno_Type_com$sun$star$text$TableColumnSeparator,
                        'TextColumn': instance.uno_Type_com$sun$star$text$TextColumn,
                        'TextContentAnchorType': instance.uno_Type_com$sun$star$text$TextContentAnchorType,
                        'TextMarkupDescriptor': instance.uno_Type_com$sun$star$text$TextMarkupDescriptor,
                        'TextPosition': instance.uno_Type_com$sun$star$text$TextPosition,
                        'TextRangeSelection': instance.uno_Type_com$sun$star$text$TextRangeSelection,
                        'VertOrientationFormat': instance.uno_Type_com$sun$star$text$VertOrientationFormat,
                        'WrapTextMode': instance.uno_Type_com$sun$star$text$WrapTextMode,
                        'WritingMode': instance.uno_Type_com$sun$star$text$WritingMode,
                        'XAutoTextContainer': instance.uno_Type_com$sun$star$text$XAutoTextContainer,
                        'XAutoTextContainer2': instance.uno_Type_com$sun$star$text$XAutoTextContainer2,
                        'XAutoTextEntry': instance.uno_Type_com$sun$star$text$XAutoTextEntry,
                        'XAutoTextGroup': instance.uno_Type_com$sun$star$text$XAutoTextGroup,
                        'XBookmarkInsertTool': instance.uno_Type_com$sun$star$text$XBookmarkInsertTool,
                        'XBookmarksSupplier': instance.uno_Type_com$sun$star$text$XBookmarksSupplier,
                        'XChapterNumberingSupplier': instance.uno_Type_com$sun$star$text$XChapterNumberingSupplier,
                        'XContentControlsSupplier': instance.uno_Type_com$sun$star$text$XContentControlsSupplier,
                        'XDefaultNumberingProvider': instance.uno_Type_com$sun$star$text$XDefaultNumberingProvider,
                        'XDependentTextField': instance.uno_Type_com$sun$star$text$XDependentTextField,
                        'XDocumentIndex': instance.uno_Type_com$sun$star$text$XDocumentIndex,
                        'XDocumentIndexMark': instance.uno_Type_com$sun$star$text$XDocumentIndexMark,
                        'XDocumentIndexesSupplier': instance.uno_Type_com$sun$star$text$XDocumentIndexesSupplier,
                        'XEndnotesSettingsSupplier': instance.uno_Type_com$sun$star$text$XEndnotesSettingsSupplier,
                        'XEndnotesSupplier': instance.uno_Type_com$sun$star$text$XEndnotesSupplier,
                        'XFlatParagraph': instance.uno_Type_com$sun$star$text$XFlatParagraph,
                        'XFlatParagraphIterator': instance.uno_Type_com$sun$star$text$XFlatParagraphIterator,
                        'XFlatParagraphIteratorProvider': instance.uno_Type_com$sun$star$text$XFlatParagraphIteratorProvider,
                        'XFootnote': instance.uno_Type_com$sun$star$text$XFootnote,
                        'XFootnotesSettingsSupplier': instance.uno_Type_com$sun$star$text$XFootnotesSettingsSupplier,
                        'XFootnotesSupplier': instance.uno_Type_com$sun$star$text$XFootnotesSupplier,
                        'XFormField': instance.uno_Type_com$sun$star$text$XFormField,
                        'XLineNumberingProperties': instance.uno_Type_com$sun$star$text$XLineNumberingProperties,
                        'XMailMergeBroadcaster': instance.uno_Type_com$sun$star$text$XMailMergeBroadcaster,
                        'XMailMergeListener': instance.uno_Type_com$sun$star$text$XMailMergeListener,
                        'XMarkingAccess': instance.uno_Type_com$sun$star$text$XMarkingAccess,
                        'XMultiTextMarkup': instance.uno_Type_com$sun$star$text$XMultiTextMarkup,
                        'XNumberingFormatter': instance.uno_Type_com$sun$star$text$XNumberingFormatter,
                        'XNumberingRulesSupplier': instance.uno_Type_com$sun$star$text$XNumberingRulesSupplier,
                        'XNumberingTypeInfo': instance.uno_Type_com$sun$star$text$XNumberingTypeInfo,
                        'XPageCursor': instance.uno_Type_com$sun$star$text$XPageCursor,
                        'XPagePrintable': instance.uno_Type_com$sun$star$text$XPagePrintable,
                        'XParagraphAppend': instance.uno_Type_com$sun$star$text$XParagraphAppend,
                        'XParagraphCursor': instance.uno_Type_com$sun$star$text$XParagraphCursor,
                        'XPasteBroadcaster': instance.uno_Type_com$sun$star$text$XPasteBroadcaster,
                        'XPasteListener': instance.uno_Type_com$sun$star$text$XPasteListener,
                        'XRedline': instance.uno_Type_com$sun$star$text$XRedline,
                        'XReferenceMarksSupplier': instance.uno_Type_com$sun$star$text$XReferenceMarksSupplier,
                        'XRelativeTextContentInsert': instance.uno_Type_com$sun$star$text$XRelativeTextContentInsert,
                        'XRelativeTextContentRemove': instance.uno_Type_com$sun$star$text$XRelativeTextContentRemove,
                        'XRubySelection': instance.uno_Type_com$sun$star$text$XRubySelection,
                        'XSentenceCursor': instance.uno_Type_com$sun$star$text$XSentenceCursor,
                        'XSimpleText': instance.uno_Type_com$sun$star$text$XSimpleText,
                        'XText': instance.uno_Type_com$sun$star$text$XText,
                        'XTextAppend': instance.uno_Type_com$sun$star$text$XTextAppend,
                        'XTextAppendAndConvert': instance.uno_Type_com$sun$star$text$XTextAppendAndConvert,
                        'XTextColumns': instance.uno_Type_com$sun$star$text$XTextColumns,
                        'XTextContent': instance.uno_Type_com$sun$star$text$XTextContent,
                        'XTextContentAppend': instance.uno_Type_com$sun$star$text$XTextContentAppend,
                        'XTextConvert': instance.uno_Type_com$sun$star$text$XTextConvert,
                        'XTextCopy': instance.uno_Type_com$sun$star$text$XTextCopy,
                        'XTextCursor': instance.uno_Type_com$sun$star$text$XTextCursor,
                        'XTextDocument': instance.uno_Type_com$sun$star$text$XTextDocument,
                        'XTextEmbeddedObjectsSupplier': instance.uno_Type_com$sun$star$text$XTextEmbeddedObjectsSupplier,
                        'XTextField': instance.uno_Type_com$sun$star$text$XTextField,
                        'XTextFieldsSupplier': instance.uno_Type_com$sun$star$text$XTextFieldsSupplier,
                        'XTextFrame': instance.uno_Type_com$sun$star$text$XTextFrame,
                        'XTextFramesSupplier': instance.uno_Type_com$sun$star$text$XTextFramesSupplier,
                        'XTextGraphicObjectsSupplier': instance.uno_Type_com$sun$star$text$XTextGraphicObjectsSupplier,
                        'XTextMarkup': instance.uno_Type_com$sun$star$text$XTextMarkup,
                        'XTextPortionAppend': instance.uno_Type_com$sun$star$text$XTextPortionAppend,
                        'XTextRange': instance.uno_Type_com$sun$star$text$XTextRange,
                        'XTextRangeCompare': instance.uno_Type_com$sun$star$text$XTextRangeCompare,
                        'XTextRangeMover': instance.uno_Type_com$sun$star$text$XTextRangeMover,
                        'XTextSection': instance.uno_Type_com$sun$star$text$XTextSection,
                        'XTextSectionsSupplier': instance.uno_Type_com$sun$star$text$XTextSectionsSupplier,
                        'XTextShapesSupplier': instance.uno_Type_com$sun$star$text$XTextShapesSupplier,
                        'XTextTable': instance.uno_Type_com$sun$star$text$XTextTable,
                        'XTextTableCursor': instance.uno_Type_com$sun$star$text$XTextTableCursor,
                        'XTextTablesSupplier': instance.uno_Type_com$sun$star$text$XTextTablesSupplier,
                        'XTextViewCursor': instance.uno_Type_com$sun$star$text$XTextViewCursor,
                        'XTextViewCursorSupplier': instance.uno_Type_com$sun$star$text$XTextViewCursorSupplier,
                        'XTextViewTextRangeSupplier': instance.uno_Type_com$sun$star$text$XTextViewTextRangeSupplier,
                        'XWordCursor': instance.uno_Type_com$sun$star$text$XWordCursor,
                        'AuthorDisplayFormat': {
                            'FIRST_NAME': 2,
                            'FULL': 0,
                            'INITIALS': 3,
                            'LAST_NAME': 1
                        },
                        'AutoTextContainer': {
                            'create': instance.uno_Function_com$sun$star$text$AutoTextContainer$$create
                        },
                        'BibliographyDataField': {
                            'ADDRESS': 2,
                            'ANNOTE': 3,
                            'AUTHOR': 4,
                            'BIBILIOGRAPHIC_TYPE': 1,
                            'BOOKTITLE': 5,
                            'CHAPTER': 6,
                            'CUSTOM1': 25,
                            'CUSTOM2': 26,
                            'CUSTOM3': 27,
                            'CUSTOM4': 28,
                            'CUSTOM5': 29,
                            'EDITION': 7,
                            'EDITOR': 8,
                            'HOWPUBLISHED': 9,
                            'IDENTIFIER': 0,
                            'INSTITUTION': 10,
                            'ISBN': 30,
                            'JOURNAL': 11,
                            'LOCAL_URL': 31,
                            'MONTH': 12,
                            'NOTE': 13,
                            'NUMBER': 14,
                            'ORGANIZATIONS': 15,
                            'PAGES': 16,
                            'PUBLISHER': 17,
                            'REPORT_TYPE': 21,
                            'SCHOOL': 18,
                            'SERIES': 19,
                            'TITLE': 20,
                            'URL': 24,
                            'VOLUME': 22,
                            'YEAR': 23
                        },
                        'BibliographyDataType': {
                            'ARTICLE': 0,
                            'BOOK': 1,
                            'BOOKLET': 2,
                            'CONFERENCE': 3,
                            'CUSTOM1': 17,
                            'CUSTOM2': 18,
                            'CUSTOM3': 19,
                            'CUSTOM4': 20,
                            'CUSTOM5': 21,
                            'EMAIL': 15,
                            'INBOOK': 4,
                            'INCOLLECTION': 5,
                            'INPROCEEDINGS': 6,
                            'JOURNAL': 7,
                            'MANUAL': 8,
                            'MASTERSTHESIS': 9,
                            'MISC': 10,
                            'PHDTHESIS': 11,
                            'PROCEEDINGS': 12,
                            'TECHREPORT': 13,
                            'UNPUBLISHED': 14,
                            'WWW': 16
                        },
                        'ChapterFormat': {
                            'DIGIT': 4,
                            'NAME': 0,
                            'NAME_NUMBER': 2,
                            'NO_PREFIX_SUFFIX': 3,
                            'NUMBER': 1
                        },
                        'CharacterCompressionType': {
                            'NONE': 0,
                            'PUNCTUATION_AND_KANA': 2,
                            'PUNCTUATION_ONLY': 1
                        },
                        'ColumnSeparatorStyle': {
                            'DASHED': 3,
                            'DOTTED': 2,
                            'NONE': 0,
                            'SOLID': 1
                        },
                        'ControlCharacter': {
                            'APPEND_PARAGRAPH': 5,
                            'HARD_HYPHEN': 2,
                            'HARD_SPACE': 4,
                            'LINE_BREAK': 1,
                            'PARAGRAPH_BREAK': 0,
                            'SOFT_HYPHEN': 3
                        },
                        'DateDisplayFormat': {
                            'DDMMMMYYYY': 5,
                            'DDMMMYYYY': 4,
                            'MMDDYY': 2,
                            'MMDDYYYY': 3,
                            'NNDDMMMMYYYY': 6,
                            'NNNNDDMMMMYYYY': 7,
                            'STANDARD_LONG': 1,
                            'STANDARD_SHORT': 0
                        },
                        'DefaultNumberingProvider': {
                            'create': instance.uno_Function_com$sun$star$text$DefaultNumberingProvider$$create
                        },
                        'DialogFactoryService': {
                            'create': instance.uno_Function_com$sun$star$text$DialogFactoryService$$create
                        },
                        'DocumentStatistic': {
                            'CHARS': 3,
                            'PAGES': 0,
                            'PARAS': 1,
                            'WORDS': 2
                        },
                        'FilenameDisplayFormat': {
                            'FULL': 0,
                            'NAME': 2,
                            'NAME_AND_EXT': 3,
                            'PATH': 1
                        },
                        'FontEmphasis': {
                            'ACCENT_ABOVE': 4,
                            'ACCENT_BELOW': 14,
                            'CIRCLE_ABOVE': 2,
                            'CIRCLE_BELOW': 12,
                            'DISK_ABOVE': 3,
                            'DISK_BELOW': 13,
                            'DOT_ABOVE': 1,
                            'DOT_BELOW': 11,
                            'NONE': 0
                        },
                        'FontRelief': {
                            'EMBOSSED': 1,
                            'ENGRAVED': 2,
                            'NONE': 0
                        },
                        'FootnoteNumbering': {
                            'PER_CHAPTER': 1,
                            'PER_DOCUMENT': 2,
                            'PER_PAGE': 0
                        },
                        'HoriOrientation': {
                            'CENTER': 2,
                            'FULL': 6,
                            'INSIDE': 4,
                            'LEFT': 3,
                            'LEFT_AND_WIDTH': 7,
                            'NONE': 0,
                            'OUTSIDE': 5,
                            'RIGHT': 1
                        },
                        'LabelFollow': {
                            'LISTTAB': 0,
                            'NEWLINE': 3,
                            'NOTHING': 2,
                            'SPACE': 1
                        },
                        'MailMergeType': {
                            'FILE': 2,
                            'MAIL': 3,
                            'PRINTER': 1,
                            'SHELL': 4
                        },
                        'ModuleDispatcher': {
                            'create': instance.uno_Function_com$sun$star$text$ModuleDispatcher$$create
                        },
                        'ParagraphHyphenationKeepType': {
                            'ALWAYS': 4,
                            'AUTO': 0,
                            'COLUMN': 3,
                            'PAGE': 2,
                            'SPREAD': 1
                        },
                        'ParagraphVertAlign': {
                            'AUTOMATIC': 0,
                            'BASELINE': 1,
                            'BOTTOM': 4,
                            'CENTER': 3,
                            'TOP': 2
                        },
                        'PlaceholderType': {
                            'GRAPHIC': 3,
                            'OBJECT': 4,
                            'TABLE': 1,
                            'TEXT': 0,
                            'TEXTFRAME': 2
                        },
                        'PositionAndSpaceMode': {
                            'LABEL_ALIGNMENT': 1,
                            'LABEL_WIDTH_AND_POSITION': 0
                        },
                        'PositionLayoutDir': {
                            'PositionInHoriL2R': 1,
                            'PositionInLayoutDirOfAnchor': 2
                        },
                        'ReferenceFieldPart': {
                            'CATEGORY_AND_NUMBER': 5,
                            'CHAPTER': 1,
                            'NUMBER': 8,
                            'NUMBER_FULL_CONTEXT': 10,
                            'NUMBER_NO_CONTEXT': 9,
                            'ONLY_CAPTION': 6,
                            'ONLY_SEQUENCE_NUMBER': 7,
                            'PAGE': 0,
                            'PAGE_DESC': 4,
                            'TEXT': 2,
                            'UP_DOWN': 3
                        },
                        'ReferenceFieldSource': {
                            'BOOKMARK': 2,
                            'ENDNOTE': 4,
                            'FOOTNOTE': 3,
                            'REFERENCE_MARK': 0,
                            'SEQUENCE_FIELD': 1,
                            'STYLE': 5
                        },
                        'RelOrientation': {
                            'CHAR': 2,
                            'FRAME': 0,
                            'FRAME_LEFT': 5,
                            'FRAME_RIGHT': 6,
                            'PAGE_FRAME': 7,
                            'PAGE_LEFT': 3,
                            'PAGE_PRINT_AREA': 8,
                            'PAGE_PRINT_AREA_BOTTOM': 10,
                            'PAGE_PRINT_AREA_TOP': 11,
                            'PAGE_RIGHT': 4,
                            'PRINT_AREA': 1,
                            'TEXT_LINE': 9
                        },
                        'RubyPosition': {
                            'ABOVE': 0,
                            'BELOW': 1,
                            'INTER_CHARACTER': 2
                        },
                        'SetVariableType': {
                            'FORMULA': 2,
                            'SEQUENCE': 1,
                            'STRING': 3,
                            'VAR': 0
                        },
                        'SizeType': {
                            'FIX': 1,
                            'MIN': 2,
                            'VARIABLE': 0
                        },
                        'TemplateDisplayFormat': {
                            'AREA': 4,
                            'FULL': 0,
                            'NAME': 2,
                            'NAME_AND_EXT': 3,
                            'PATH': 1,
                            'TITLE': 5
                        },
                        'TextGridMode': {
                            'LINES': 1,
                            'LINES_AND_CHARS': 2,
                            'NONE': 0
                        },
                        'TextMarkupType': {
                            'PROOFREADING': 2,
                            'SENTENCE': 4,
                            'SMARTTAG': 3,
                            'SPELLCHECK': 1,
                            'TRACK_CHANGE_DELETION': 6,
                            'TRACK_CHANGE_FORMATCHANGE': 7,
                            'TRACK_CHANGE_INSERTION': 5
                        },
                        'TimeDisplayFormat': {
                            'HHMM': 1,
                            'HHMMAMPM': 4,
                            'HHMMSS': 2,
                            'HHMMSS00': 3,
                            'HHMMSS00AMPM': 6,
                            'HHMMSSAMPM': 5,
                            'STANDARD': 0
                        },
                        'UserDataPart': {
                            'CITY': 7,
                            'COMPANY': 0,
                            'COUNTRY': 5,
                            'EMAIL': 13,
                            'FAX': 12,
                            'FIRSTNAME': 1,
                            'NAME': 2,
                            'PHONE_COMPANY': 11,
                            'PHONE_PRIVATE': 10,
                            'POSITION': 9,
                            'SHORTCUT': 3,
                            'STATE': 14,
                            'STREET': 4,
                            'TITLE': 8,
                            'ZIP': 6
                        },
                        'UserFieldFormat': {
                            'NUM': 2,
                            'SYSTEM': 0,
                            'TEXT': 1
                        },
                        'VertOrientation': {
                            'BOTTOM': 3,
                            'CENTER': 2,
                            'CHAR_BOTTOM': 6,
                            'CHAR_CENTER': 5,
                            'CHAR_TOP': 4,
                            'LINE_BOTTOM': 9,
                            'LINE_CENTER': 8,
                            'LINE_TOP': 7,
                            'NONE': 0,
                            'TOP': 1
                        },
                        'WrapInfluenceOnPosition': {
                            'ITERATIVE': 3,
                            'ONCE_CONCURRENT': 2,
                            'ONCE_SUCCESSIVE': 1
                        },
                        'WritingMode2': {
                            'BT_LR': 5,
                            'CONTEXT': 4,
                            'LR_TB': 0,
                            'PAGE': 4,
                            'RL_TB': 1,
                            'STACKED': 7,
                            'TB_LR': 3,
                            'TB_RL': 2,
                            'TB_RL90': 6
                        },
                        'fieldmaster': {
                        },
                        'textfield': {
                            'Type': {
                                'AUTHOR': 8,
                                'DATE': 0,
                                'DOCINFO_CUSTOM': 15,
                                'DOCINFO_TITLE': 10,
                                'EXTENDED_FILE': 7,
                                'EXTENDED_TIME': 6,
                                'MEASURE': 9,
                                'PAGE': 2,
                                'PAGES': 3,
                                'PAGE_NAME': 14,
                                'PRESENTATION_DATE_TIME': 13,
                                'PRESENTATION_FOOTER': 12,
                                'PRESENTATION_HEADER': 11,
                                'TABLE': 5,
                                'TIME': 4,
                                'UNSPECIFIED': -1,
                                'URL': 1
                            },
                            'docinfo': {
                            }
                        }
                    },
                    'tiledrendering': {
                        'XTiledRenderable': instance.uno_Type_com$sun$star$tiledrendering$XTiledRenderable
                    },
                    'ucb': {
                        'AlreadyInitializedException': instance.uno_Type_com$sun$star$ucb$AlreadyInitializedException,
                        'AuthenticationFallbackRequest': instance.uno_Type_com$sun$star$ucb$AuthenticationFallbackRequest,
                        'AuthenticationRequest': instance.uno_Type_com$sun$star$ucb$AuthenticationRequest,
                        'CertificateValidationRequest': instance.uno_Type_com$sun$star$ucb$CertificateValidationRequest,
                        'CheckinArgument': instance.uno_Type_com$sun$star$ucb$CheckinArgument,
                        'Command': instance.uno_Type_com$sun$star$ucb$Command,
                        'CommandAbortedException': instance.uno_Type_com$sun$star$ucb$CommandAbortedException,
                        'CommandFailedException': instance.uno_Type_com$sun$star$ucb$CommandFailedException,
                        'CommandInfo': instance.uno_Type_com$sun$star$ucb$CommandInfo,
                        'CommandInfoChangeEvent': instance.uno_Type_com$sun$star$ucb$CommandInfoChangeEvent,
                        'ContentCreationError': instance.uno_Type_com$sun$star$ucb$ContentCreationError,
                        'ContentCreationException': instance.uno_Type_com$sun$star$ucb$ContentCreationException,
                        'ContentEvent': instance.uno_Type_com$sun$star$ucb$ContentEvent,
                        'ContentInfo': instance.uno_Type_com$sun$star$ucb$ContentInfo,
                        'ContentProviderInfo': instance.uno_Type_com$sun$star$ucb$ContentProviderInfo,
                        'CrossReference': instance.uno_Type_com$sun$star$ucb$CrossReference,
                        'DocumentHeaderField': instance.uno_Type_com$sun$star$ucb$DocumentHeaderField,
                        'DocumentStoreMode': instance.uno_Type_com$sun$star$ucb$DocumentStoreMode,
                        'DuplicateCommandIdentifierException': instance.uno_Type_com$sun$star$ucb$DuplicateCommandIdentifierException,
                        'DuplicateProviderException': instance.uno_Type_com$sun$star$ucb$DuplicateProviderException,
                        'ExportStreamInfo': instance.uno_Type_com$sun$star$ucb$ExportStreamInfo,
                        'FetchResult': instance.uno_Type_com$sun$star$ucb$FetchResult,
                        'FolderList': instance.uno_Type_com$sun$star$ucb$FolderList,
                        'FolderListCommand': instance.uno_Type_com$sun$star$ucb$FolderListCommand,
                        'FolderListEntry': instance.uno_Type_com$sun$star$ucb$FolderListEntry,
                        'GlobalTransferCommandArgument': instance.uno_Type_com$sun$star$ucb$GlobalTransferCommandArgument,
                        'GlobalTransferCommandArgument2': instance.uno_Type_com$sun$star$ucb$GlobalTransferCommandArgument2,
                        'IOErrorCode': instance.uno_Type_com$sun$star$ucb$IOErrorCode,
                        'IllegalIdentifierException': instance.uno_Type_com$sun$star$ucb$IllegalIdentifierException,
                        'InsertCommandArgument': instance.uno_Type_com$sun$star$ucb$InsertCommandArgument,
                        'InsertCommandArgument2': instance.uno_Type_com$sun$star$ucb$InsertCommandArgument2,
                        'InteractiveAppException': instance.uno_Type_com$sun$star$ucb$InteractiveAppException,
                        'InteractiveAugmentedIOException': instance.uno_Type_com$sun$star$ucb$InteractiveAugmentedIOException,
                        'InteractiveBadTransferURLException': instance.uno_Type_com$sun$star$ucb$InteractiveBadTransferURLException,
                        'InteractiveFileIOException': instance.uno_Type_com$sun$star$ucb$InteractiveFileIOException,
                        'InteractiveIOException': instance.uno_Type_com$sun$star$ucb$InteractiveIOException,
                        'InteractiveLockingException': instance.uno_Type_com$sun$star$ucb$InteractiveLockingException,
                        'InteractiveLockingLockExpiredException': instance.uno_Type_com$sun$star$ucb$InteractiveLockingLockExpiredException,
                        'InteractiveLockingLockedException': instance.uno_Type_com$sun$star$ucb$InteractiveLockingLockedException,
                        'InteractiveLockingNotLockedException': instance.uno_Type_com$sun$star$ucb$InteractiveLockingNotLockedException,
                        'InteractiveNetworkConnectException': instance.uno_Type_com$sun$star$ucb$InteractiveNetworkConnectException,
                        'InteractiveNetworkException': instance.uno_Type_com$sun$star$ucb$InteractiveNetworkException,
                        'InteractiveNetworkGeneralException': instance.uno_Type_com$sun$star$ucb$InteractiveNetworkGeneralException,
                        'InteractiveNetworkOffLineException': instance.uno_Type_com$sun$star$ucb$InteractiveNetworkOffLineException,
                        'InteractiveNetworkReadException': instance.uno_Type_com$sun$star$ucb$InteractiveNetworkReadException,
                        'InteractiveNetworkResolveNameException': instance.uno_Type_com$sun$star$ucb$InteractiveNetworkResolveNameException,
                        'InteractiveNetworkWriteException': instance.uno_Type_com$sun$star$ucb$InteractiveNetworkWriteException,
                        'InteractiveWrongMediumException': instance.uno_Type_com$sun$star$ucb$InteractiveWrongMediumException,
                        'Link': instance.uno_Type_com$sun$star$ucb$Link,
                        'ListAction': instance.uno_Type_com$sun$star$ucb$ListAction,
                        'ListEvent': instance.uno_Type_com$sun$star$ucb$ListEvent,
                        'ListenerAlreadySetException': instance.uno_Type_com$sun$star$ucb$ListenerAlreadySetException,
                        'Lock': instance.uno_Type_com$sun$star$ucb$Lock,
                        'LockDepth': instance.uno_Type_com$sun$star$ucb$LockDepth,
                        'LockEntry': instance.uno_Type_com$sun$star$ucb$LockEntry,
                        'LockScope': instance.uno_Type_com$sun$star$ucb$LockScope,
                        'LockType': instance.uno_Type_com$sun$star$ucb$LockType,
                        'MissingInputStreamException': instance.uno_Type_com$sun$star$ucb$MissingInputStreamException,
                        'MissingPropertiesException': instance.uno_Type_com$sun$star$ucb$MissingPropertiesException,
                        'NameClashException': instance.uno_Type_com$sun$star$ucb$NameClashException,
                        'NameClashResolveRequest': instance.uno_Type_com$sun$star$ucb$NameClashResolveRequest,
                        'NumberedSortingInfo': instance.uno_Type_com$sun$star$ucb$NumberedSortingInfo,
                        'OpenCommandArgument': instance.uno_Type_com$sun$star$ucb$OpenCommandArgument,
                        'OpenCommandArgument2': instance.uno_Type_com$sun$star$ucb$OpenCommandArgument2,
                        'OpenCommandArgument3': instance.uno_Type_com$sun$star$ucb$OpenCommandArgument3,
                        'OutgoingMessageState': instance.uno_Type_com$sun$star$ucb$OutgoingMessageState,
                        'PostCommandArgument': instance.uno_Type_com$sun$star$ucb$PostCommandArgument,
                        'PostCommandArgument2': instance.uno_Type_com$sun$star$ucb$PostCommandArgument2,
                        'Priority': instance.uno_Type_com$sun$star$ucb$Priority,
                        'PropertyCommandArgument': instance.uno_Type_com$sun$star$ucb$PropertyCommandArgument,
                        'PropertyValueInfo': instance.uno_Type_com$sun$star$ucb$PropertyValueInfo,
                        'PropertyValueState': instance.uno_Type_com$sun$star$ucb$PropertyValueState,
                        'RecipientInfo': instance.uno_Type_com$sun$star$ucb$RecipientInfo,
                        'RememberAuthentication': instance.uno_Type_com$sun$star$ucb$RememberAuthentication,
                        'RemoteContentProviderChangeAction': instance.uno_Type_com$sun$star$ucb$RemoteContentProviderChangeAction,
                        'RemoteContentProviderChangeEvent': instance.uno_Type_com$sun$star$ucb$RemoteContentProviderChangeEvent,
                        'ResultSetException': instance.uno_Type_com$sun$star$ucb$ResultSetException,
                        'Rule': instance.uno_Type_com$sun$star$ucb$Rule,
                        'RuleSet': instance.uno_Type_com$sun$star$ucb$RuleSet,
                        'RuleTerm': instance.uno_Type_com$sun$star$ucb$RuleTerm,
                        'SearchCommandArgument': instance.uno_Type_com$sun$star$ucb$SearchCommandArgument,
                        'SearchCriterium': instance.uno_Type_com$sun$star$ucb$SearchCriterium,
                        'SearchInfo': instance.uno_Type_com$sun$star$ucb$SearchInfo,
                        'SearchRecursion': instance.uno_Type_com$sun$star$ucb$SearchRecursion,
                        'SendInfo': instance.uno_Type_com$sun$star$ucb$SendInfo,
                        'SendMediaTypes': instance.uno_Type_com$sun$star$ucb$SendMediaTypes,
                        'ServiceNotFoundException': instance.uno_Type_com$sun$star$ucb$ServiceNotFoundException,
                        'SortingInfo': instance.uno_Type_com$sun$star$ucb$SortingInfo,
                        'SynchronizePolicy': instance.uno_Type_com$sun$star$ucb$SynchronizePolicy,
                        'TransferCommandOperation': instance.uno_Type_com$sun$star$ucb$TransferCommandOperation,
                        'TransferInfo': instance.uno_Type_com$sun$star$ucb$TransferInfo,
                        'TransferInfo2': instance.uno_Type_com$sun$star$ucb$TransferInfo2,
                        'TransferResult': instance.uno_Type_com$sun$star$ucb$TransferResult,
                        'URLAuthenticationRequest': instance.uno_Type_com$sun$star$ucb$URLAuthenticationRequest,
                        'UnsupportedCommandException': instance.uno_Type_com$sun$star$ucb$UnsupportedCommandException,
                        'UnsupportedDataSinkException': instance.uno_Type_com$sun$star$ucb$UnsupportedDataSinkException,
                        'UnsupportedNameClashException': instance.uno_Type_com$sun$star$ucb$UnsupportedNameClashException,
                        'UnsupportedOpenModeException': instance.uno_Type_com$sun$star$ucb$UnsupportedOpenModeException,
                        'VerificationMode': instance.uno_Type_com$sun$star$ucb$VerificationMode,
                        'WebDAVHTTPMethod': instance.uno_Type_com$sun$star$ucb$WebDAVHTTPMethod,
                        'WelcomeDynamicResultSetStruct': instance.uno_Type_com$sun$star$ucb$WelcomeDynamicResultSetStruct,
                        'XAnyCompare': instance.uno_Type_com$sun$star$ucb$XAnyCompare,
                        'XAnyCompareFactory': instance.uno_Type_com$sun$star$ucb$XAnyCompareFactory,
                        'XCachedContentResultSetFactory': instance.uno_Type_com$sun$star$ucb$XCachedContentResultSetFactory,
                        'XCachedContentResultSetStubFactory': instance.uno_Type_com$sun$star$ucb$XCachedContentResultSetStubFactory,
                        'XCachedDynamicResultSetFactory': instance.uno_Type_com$sun$star$ucb$XCachedDynamicResultSetFactory,
                        'XCachedDynamicResultSetStubFactory': instance.uno_Type_com$sun$star$ucb$XCachedDynamicResultSetStubFactory,
                        'XCommandEnvironment': instance.uno_Type_com$sun$star$ucb$XCommandEnvironment,
                        'XCommandInfo': instance.uno_Type_com$sun$star$ucb$XCommandInfo,
                        'XCommandInfoChangeListener': instance.uno_Type_com$sun$star$ucb$XCommandInfoChangeListener,
                        'XCommandInfoChangeNotifier': instance.uno_Type_com$sun$star$ucb$XCommandInfoChangeNotifier,
                        'XCommandProcessor': instance.uno_Type_com$sun$star$ucb$XCommandProcessor,
                        'XCommandProcessor2': instance.uno_Type_com$sun$star$ucb$XCommandProcessor2,
                        'XContent': instance.uno_Type_com$sun$star$ucb$XContent,
                        'XContentAccess': instance.uno_Type_com$sun$star$ucb$XContentAccess,
                        'XContentCreator': instance.uno_Type_com$sun$star$ucb$XContentCreator,
                        'XContentEventListener': instance.uno_Type_com$sun$star$ucb$XContentEventListener,
                        'XContentIdentifier': instance.uno_Type_com$sun$star$ucb$XContentIdentifier,
                        'XContentIdentifierFactory': instance.uno_Type_com$sun$star$ucb$XContentIdentifierFactory,
                        'XContentIdentifierMapping': instance.uno_Type_com$sun$star$ucb$XContentIdentifierMapping,
                        'XContentProvider': instance.uno_Type_com$sun$star$ucb$XContentProvider,
                        'XContentProviderFactory': instance.uno_Type_com$sun$star$ucb$XContentProviderFactory,
                        'XContentProviderManager': instance.uno_Type_com$sun$star$ucb$XContentProviderManager,
                        'XContentProviderSupplier': instance.uno_Type_com$sun$star$ucb$XContentProviderSupplier,
                        'XContentTransmitter': instance.uno_Type_com$sun$star$ucb$XContentTransmitter,
                        'XDataContainer': instance.uno_Type_com$sun$star$ucb$XDataContainer,
                        'XDynamicResultSet': instance.uno_Type_com$sun$star$ucb$XDynamicResultSet,
                        'XDynamicResultSetListener': instance.uno_Type_com$sun$star$ucb$XDynamicResultSetListener,
                        'XFetchProvider': instance.uno_Type_com$sun$star$ucb$XFetchProvider,
                        'XFetchProviderForContentAccess': instance.uno_Type_com$sun$star$ucb$XFetchProviderForContentAccess,
                        'XFileIdentifierConverter': instance.uno_Type_com$sun$star$ucb$XFileIdentifierConverter,
                        'XInteractionAuthFallback': instance.uno_Type_com$sun$star$ucb$XInteractionAuthFallback,
                        'XInteractionHandlerSupplier': instance.uno_Type_com$sun$star$ucb$XInteractionHandlerSupplier,
                        'XInteractionReplaceExistingData': instance.uno_Type_com$sun$star$ucb$XInteractionReplaceExistingData,
                        'XInteractionSupplyAuthentication': instance.uno_Type_com$sun$star$ucb$XInteractionSupplyAuthentication,
                        'XInteractionSupplyAuthentication2': instance.uno_Type_com$sun$star$ucb$XInteractionSupplyAuthentication2,
                        'XInteractionSupplyName': instance.uno_Type_com$sun$star$ucb$XInteractionSupplyName,
                        'XParameterizedContentProvider': instance.uno_Type_com$sun$star$ucb$XParameterizedContentProvider,
                        'XPersistentPropertySet': instance.uno_Type_com$sun$star$ucb$XPersistentPropertySet,
                        'XProgressHandler': instance.uno_Type_com$sun$star$ucb$XProgressHandler,
                        'XPropertyMatcher': instance.uno_Type_com$sun$star$ucb$XPropertyMatcher,
                        'XPropertyMatcherFactory': instance.uno_Type_com$sun$star$ucb$XPropertyMatcherFactory,
                        'XPropertySetRegistry': instance.uno_Type_com$sun$star$ucb$XPropertySetRegistry,
                        'XPropertySetRegistryFactory': instance.uno_Type_com$sun$star$ucb$XPropertySetRegistryFactory,
                        'XRecycler': instance.uno_Type_com$sun$star$ucb$XRecycler,
                        'XRemoteContentProviderAcceptor': instance.uno_Type_com$sun$star$ucb$XRemoteContentProviderAcceptor,
                        'XRemoteContentProviderActivator': instance.uno_Type_com$sun$star$ucb$XRemoteContentProviderActivator,
                        'XRemoteContentProviderChangeListener': instance.uno_Type_com$sun$star$ucb$XRemoteContentProviderChangeListener,
                        'XRemoteContentProviderChangeNotifier': instance.uno_Type_com$sun$star$ucb$XRemoteContentProviderChangeNotifier,
                        'XRemoteContentProviderConnectionControl': instance.uno_Type_com$sun$star$ucb$XRemoteContentProviderConnectionControl,
                        'XRemoteContentProviderDistributor': instance.uno_Type_com$sun$star$ucb$XRemoteContentProviderDistributor,
                        'XRemoteContentProviderDoneListener': instance.uno_Type_com$sun$star$ucb$XRemoteContentProviderDoneListener,
                        'XRemoteContentProviderSupplier': instance.uno_Type_com$sun$star$ucb$XRemoteContentProviderSupplier,
                        'XSimpleFileAccess': instance.uno_Type_com$sun$star$ucb$XSimpleFileAccess,
                        'XSimpleFileAccess2': instance.uno_Type_com$sun$star$ucb$XSimpleFileAccess2,
                        'XSimpleFileAccess3': instance.uno_Type_com$sun$star$ucb$XSimpleFileAccess3,
                        'XSortedDynamicResultSetFactory': instance.uno_Type_com$sun$star$ucb$XSortedDynamicResultSetFactory,
                        'XSourceInitialization': instance.uno_Type_com$sun$star$ucb$XSourceInitialization,
                        'XUniversalContentBroker': instance.uno_Type_com$sun$star$ucb$XUniversalContentBroker,
                        'XWebDAVCommandEnvironment': instance.uno_Type_com$sun$star$ucb$XWebDAVCommandEnvironment,
                        'AnyCompareFactory': {
                            'createWithLocale': instance.uno_Function_com$sun$star$ucb$AnyCompareFactory$$createWithLocale
                        },
                        'CachedContentResultSetFactory': {
                            'create': instance.uno_Function_com$sun$star$ucb$CachedContentResultSetFactory$$create
                        },
                        'CachedContentResultSetStubFactory': {
                            'create': instance.uno_Function_com$sun$star$ucb$CachedContentResultSetStubFactory$$create
                        },
                        'CachedDynamicResultSetFactory': {
                            'create': instance.uno_Function_com$sun$star$ucb$CachedDynamicResultSetFactory$$create
                        },
                        'CachedDynamicResultSetStubFactory': {
                            'create': instance.uno_Function_com$sun$star$ucb$CachedDynamicResultSetStubFactory$$create
                        },
                        'CommandEnvironment': {
                            'create': instance.uno_Function_com$sun$star$ucb$CommandEnvironment$$create
                        },
                        'CommandInfoChange': {
                            'COMMAND_INSERTED': 0,
                            'COMMAND_REMOVED': 1
                        },
                        'ConnectionMode': {
                            'OFFLINE': 1,
                            'ONLINE': 0
                        },
                        'ContentAction': {
                            'DELETED': 2,
                            'EXCHANGED': 4,
                            'INSERTED': 0,
                            'REMOVED': 1,
                            'SEARCH_MATCHED': 128
                        },
                        'ContentInfoAttribute': {
                            'INSERT_WITH_INPUTSTREAM': 1,
                            'KIND_DOCUMENT': 2,
                            'KIND_FOLDER': 4,
                            'KIND_LINK': 8,
                            'NONE': 0
                        },
                        'ContentProviderProxyFactory': {
                            'create': instance.uno_Function_com$sun$star$ucb$ContentProviderProxyFactory$$create
                        },
                        'ContentResultSetCapability': {
                            'SORTED': 1
                        },
                        'Error': {
                            'ACCOUNT_SYNTAX': 122977,
                            'BAD_CCMAIL_EXPORT_PASSWORD': 122909,
                            'BAD_INET': 122965,
                            'CCMAIL_EXPORT_ERROR': 122905,
                            'CCMAIL_EXPORT_NOT_TERMINATING': 122957,
                            'CCMAIL_EXPORT_TOO_LONG': 122910,
                            'CNTOUT_NO_FROM': 122890,
                            'CONFIRM_EMPTY_TRASH': 122952,
                            'CONNECT_FAILURE': 122883,
                            'COULD_NOT_INIT_COMPONENT': 122961,
                            'DELETE_ABORTED': 122892,
                            'DO_LOG': 122947,
                            'EMPTY_SERVERNAME': 122963,
                            'EMPTY_USERNAME': 122964,
                            'EXTERNAL_COMMAND_FAILED': 122958,
                            'FILE_EXISTS': 122921,
                            'FILE_NOT_EXISTS': 122922,
                            'FOLDER_EXISTS': 122911,
                            'FOLDER_INVALID': 122896,
                            'FOLDER_NOT_EXISTS': 122912,
                            'FSYS_ACCESS_DENIED': 122926,
                            'FSYS_CACHE_INCONSISTENT': 122940,
                            'FSYS_CANT_ITERATE': 122937,
                            'FSYS_CANT_RESOLVE_CONFLICT': 122936,
                            'FSYS_DELETE': 122944,
                            'FSYS_INSERT_MEDIUM': 122955,
                            'FSYS_INVALID_CHAR': 122924,
                            'FSYS_INVALID_DEVICE': 122925,
                            'FSYS_IS_MARKED': 122945,
                            'FSYS_IS_WILDCARD': 122933,
                            'FSYS_LOCK': 122942,
                            'FSYS_LOCK_VIOLATION': 122927,
                            'FSYS_LOST_ROOT': 122949,
                            'FSYS_MISPLACED_CHAR': 122923,
                            'FSYS_NOT_A_DIRECTORY': 122932,
                            'FSYS_NOT_A_FILE': 122931,
                            'FSYS_NOT_SUPPORTED': 122929,
                            'FSYS_NO_TARGET': 122953,
                            'FSYS_READONLY': 122941,
                            'FSYS_RECURSIVE': 122954,
                            'FSYS_ROOT_DELETE': 122920,
                            'FSYS_UNKNOWN': 122930,
                            'FSYS_UNLOCK': 122943,
                            'FSYS_UPDATE_NEEDED': 122935,
                            'FSYS_VOLUME_FULL': 122928,
                            'FTP_DCONFAILURE': 122901,
                            'FTP_GENERAL_FAILURE': 122946,
                            'FTP_NETWORKERROR': 122898,
                            'FTP_NOTNECESSARYCMD': 122899,
                            'FTP_PROXY': 122950,
                            'FTP_RESOLVERERROR': 122897,
                            'FTP_SERVICEUNAVAILABLE': 122900,
                            'FTP_TRANSFERABORTED': 122902,
                            'HTTP_COOKIE_REQUEST': 122948,
                            'ILLEGAL_CCMAIL_EXPORT_FILE': 122907,
                            'ILLEGAL_MESSAGE_ID': 122914,
                            'IMAP_BAD_SERVER': 122969,
                            'IMAP_BAD_TITLE': 122971,
                            'IMAP_CONNECTION_CLOSED': 122967,
                            'IMAP_NOT_IMAP4': 122968,
                            'IMAP_SERVER_MSG': 122966,
                            'IS_RESCHEDULED': 122918,
                            'LOGIN_FAILURE_ACCOUNT': 122976,
                            'LOGIN_FAILURE_MAILSEND': 122882,
                            'LOGIN_FAILURE_NEWSSEND': 122881,
                            'LOGIN_FAILURE_RECEIVE': 122880,
                            'MESSAGE_NOT_FOUND': 122908,
                            'MULTIPLE_NOT_SEARCHABLE': 122939,
                            'NONE': 0,
                            'NOTAVAILABLE': 122894,
                            'NOT_HANDLED': 122960,
                            'NO_CCMAIL_EXPORT_FILE': 122906,
                            'NO_DOCINFO': 122956,
                            'NO_VIM_BBOARDLIST': 122913,
                            'NO_VIM_LIBRARY': 122903,
                            'ONE_NOT_SEARCHABLE': 122938,
                            'PASSWORD_SYNTAX': 122973,
                            'QUERY_DELETE': 122893,
                            'QUERY_DELETE_CACHE': 122974,
                            'RENAMED_WRONG_FILE_FORMAT': 122934,
                            'RENAME_FAILED': 122959,
                            'REORGANIZE_FILE_LOCKED': 122970,
                            'REORGANIZE_NO_DISKSPACE': 122975,
                            'SERVERNAME_SYNTAX': 122916,
                            'SERVER_CONNECT_FAILURE': 122972,
                            'SERVER_PORT_SYNTAX': 122915,
                            'SOURCE_SAME_AS_TARGET': 122951,
                            'STORAGE_KILLED': 122887,
                            'STORAGE_READONLY': 122886,
                            'TOO_MANY_GROUPS': 122891,
                            'TRANSFER_URL_NOT_SUPPORTED': 122962,
                            'UCB_OFFLINE': 122884,
                            'UCB_SERVER_ERROR': 122885,
                            'UNSUPPORTED_URL': 122889,
                            'USERNAME_SYNTAX': 122917,
                            'VIM_LIBRARY_CORRUPTED': 122904,
                            'VIM_LIBRARY_ERROR': 122895,
                            'VIM_NO_FAKE_MESSAGE_ID': 122919,
                            'WRONG_FILE_FORMAT': 122888
                        },
                        'FetchError': {
                            'ENDOFDATA': 1,
                            'EXCEPTION': 2,
                            'SUCCESS': 0
                        },
                        'FileSystemNotation': {
                            'DOS_NOTATION': 2,
                            'MAC_NOTATION': 3,
                            'UNIX_NOTATION': 1,
                            'UNKNOWN_NOTATION': 0
                        },
                        'ListActionType': {
                            'CLEARED': 23,
                            'COMPLETED': 27,
                            'INSERTED': 21,
                            'MOVED': 24,
                            'PROPERTIES_CHANGED': 25,
                            'REMOVED': 22,
                            'WELCOME': 20
                        },
                        'NameClash': {
                            'ASK': 4,
                            'ERROR': 0,
                            'KEEP': 3,
                            'OVERWRITE': 1,
                            'RENAME': 2
                        },
                        'OpenMode': {
                            'ALL': 0,
                            'DOCUMENT': 2,
                            'DOCUMENTS': 3,
                            'DOCUMENT_SHARE_DENY_NONE': 4,
                            'DOCUMENT_SHARE_DENY_WRITE': 5,
                            'FOLDERS': 1
                        },
                        'PropertiesManager': {
                            'create': instance.uno_Function_com$sun$star$ucb$PropertiesManager$$create
                        },
                        'RuleAction': {
                            'COPY': 8,
                            'DELETE': 9,
                            'FORWARD': 11,
                            'HIDE': 2,
                            'LINK': 10,
                            'MARK': 3,
                            'MARKREAD': 5,
                            'MARKUNREAD': 6,
                            'MOVE': 7,
                            'NONE': 0,
                            'SHOW': 1,
                            'UNMARK': 4
                        },
                        'RuleOperator': {
                            'CONTAINS': 1,
                            'CONTAINSNOT': 2,
                            'EQUAL': 5,
                            'GREATEREQUAL': 3,
                            'LESSEQUAL': 4,
                            'NOTEQUAL': 6,
                            'VALUE_FALSE': 8,
                            'VALUE_TRUE': 7
                        },
                        'SimpleFileAccess': {
                            'create': instance.uno_Function_com$sun$star$ucb$SimpleFileAccess$$create
                        },
                        'SortedDynamicResultSetFactory': {
                            'create': instance.uno_Function_com$sun$star$ucb$SortedDynamicResultSetFactory$$create
                        },
                        'Store': {
                            'create': instance.uno_Function_com$sun$star$ucb$Store$$create
                        },
                        'UniversalContentBroker': {
                            'create': instance.uno_Function_com$sun$star$ucb$UniversalContentBroker$$create
                        }
                    },
                    'ui': {
                        'ConfigurationEvent': instance.uno_Type_com$sun$star$ui$ConfigurationEvent,
                        'ContextChangeEventMultiplexer': instance.uno_Function_com$sun$star$ui$ContextChangeEventMultiplexer,
                        'ContextChangeEventObject': instance.uno_Type_com$sun$star$ui$ContextChangeEventObject,
                        'ContextMenuExecuteEvent': instance.uno_Type_com$sun$star$ui$ContextMenuExecuteEvent,
                        'ContextMenuInterceptorAction': instance.uno_Type_com$sun$star$ui$ContextMenuInterceptorAction,
                        'DockingArea': instance.uno_Type_com$sun$star$ui$DockingArea,
                        'LayoutSize': instance.uno_Type_com$sun$star$ui$LayoutSize,
                        'XAcceleratorConfiguration': instance.uno_Type_com$sun$star$ui$XAcceleratorConfiguration,
                        'XContextChangeEventListener': instance.uno_Type_com$sun$star$ui$XContextChangeEventListener,
                        'XContextChangeEventMultiplexer': instance.uno_Type_com$sun$star$ui$XContextChangeEventMultiplexer,
                        'XContextMenuInterception': instance.uno_Type_com$sun$star$ui$XContextMenuInterception,
                        'XContextMenuInterceptor': instance.uno_Type_com$sun$star$ui$XContextMenuInterceptor,
                        'XDeck': instance.uno_Type_com$sun$star$ui$XDeck,
                        'XDecks': instance.uno_Type_com$sun$star$ui$XDecks,
                        'XDockingAreaAcceptor': instance.uno_Type_com$sun$star$ui$XDockingAreaAcceptor,
                        'XImageManager': instance.uno_Type_com$sun$star$ui$XImageManager,
                        'XModuleUIConfigurationManager': instance.uno_Type_com$sun$star$ui$XModuleUIConfigurationManager,
                        'XModuleUIConfigurationManager2': instance.uno_Type_com$sun$star$ui$XModuleUIConfigurationManager2,
                        'XModuleUIConfigurationManagerSupplier': instance.uno_Type_com$sun$star$ui$XModuleUIConfigurationManagerSupplier,
                        'XPanel': instance.uno_Type_com$sun$star$ui$XPanel,
                        'XPanels': instance.uno_Type_com$sun$star$ui$XPanels,
                        'XSidebar': instance.uno_Type_com$sun$star$ui$XSidebar,
                        'XSidebarPanel': instance.uno_Type_com$sun$star$ui$XSidebarPanel,
                        'XSidebarProvider': instance.uno_Type_com$sun$star$ui$XSidebarProvider,
                        'XStatusbarItem': instance.uno_Type_com$sun$star$ui$XStatusbarItem,
                        'XToolPanel': instance.uno_Type_com$sun$star$ui$XToolPanel,
                        'XUIConfiguration': instance.uno_Type_com$sun$star$ui$XUIConfiguration,
                        'XUIConfigurationListener': instance.uno_Type_com$sun$star$ui$XUIConfigurationListener,
                        'XUIConfigurationManager': instance.uno_Type_com$sun$star$ui$XUIConfigurationManager,
                        'XUIConfigurationManager2': instance.uno_Type_com$sun$star$ui$XUIConfigurationManager2,
                        'XUIConfigurationManagerSupplier': instance.uno_Type_com$sun$star$ui$XUIConfigurationManagerSupplier,
                        'XUIConfigurationPersistence': instance.uno_Type_com$sun$star$ui$XUIConfigurationPersistence,
                        'XUIConfigurationStorage': instance.uno_Type_com$sun$star$ui$XUIConfigurationStorage,
                        'XUIElement': instance.uno_Type_com$sun$star$ui$XUIElement,
                        'XUIElementFactory': instance.uno_Type_com$sun$star$ui$XUIElementFactory,
                        'XUIElementFactoryManager': instance.uno_Type_com$sun$star$ui$XUIElementFactoryManager,
                        'XUIElementFactoryRegistration': instance.uno_Type_com$sun$star$ui$XUIElementFactoryRegistration,
                        'XUIElementSettings': instance.uno_Type_com$sun$star$ui$XUIElementSettings,
                        'XUIFunctionListener': instance.uno_Type_com$sun$star$ui$XUIFunctionListener,
                        'XUpdateModel': instance.uno_Type_com$sun$star$ui$XUpdateModel,
                        'theModuleUIConfigurationManagerSupplier': instance.uno_Function_com$sun$star$ui$theModuleUIConfigurationManagerSupplier,
                        'theUICategoryDescription': instance.uno_Function_com$sun$star$ui$theUICategoryDescription,
                        'theUIElementFactoryManager': instance.uno_Function_com$sun$star$ui$theUIElementFactoryManager,
                        'theWindowContentFactoryManager': instance.uno_Function_com$sun$star$ui$theWindowContentFactoryManager,
                        'theWindowStateConfiguration': instance.uno_Function_com$sun$star$ui$theWindowStateConfiguration,
                        'ActionTriggerSeparatorType': {
                            'LINE': 0,
                            'LINEBREAK': 2,
                            'SPACE': 1
                        },
                        'AddressBookSourceDialog': {
                            'createWithDataSource': instance.uno_Function_com$sun$star$ui$AddressBookSourceDialog$$createWithDataSource
                        },
                        'DocumentAcceleratorConfiguration': {
                            'createWithDocumentRoot': instance.uno_Function_com$sun$star$ui$DocumentAcceleratorConfiguration$$createWithDocumentRoot
                        },
                        'GlobalAcceleratorConfiguration': {
                            'create': instance.uno_Function_com$sun$star$ui$GlobalAcceleratorConfiguration$$create
                        },
                        'ImageManager': {
                            'create': instance.uno_Function_com$sun$star$ui$ImageManager$$create
                        },
                        'ImageType': {
                            'COLOR_HIGHCONTRAST': 4,
                            'COLOR_NORMAL': 0,
                            'SIZE_32': 2,
                            'SIZE_DEFAULT': 0,
                            'SIZE_LARGE': 1
                        },
                        'ItemStyle': {
                            'ALIGN_CENTER': 2,
                            'ALIGN_LEFT': 1,
                            'ALIGN_RIGHT': 3,
                            'AUTO_SIZE': 32,
                            'DRAW_FLAT': 12,
                            'DRAW_IN3D': 8,
                            'DRAW_OUT3D': 4,
                            'DROPDOWN_ONLY': 1024,
                            'DROP_DOWN': 256,
                            'ICON': 128,
                            'MANDATORY': 4096,
                            'OWNER_DRAW': 16,
                            'RADIO_CHECK': 64,
                            'REPEAT': 512,
                            'TEXT': 2048
                        },
                        'ItemType': {
                            'DEFAULT': 0,
                            'SEPARATOR_LINE': 1,
                            'SEPARATOR_LINEBREAK': 3,
                            'SEPARATOR_SPACE': 2
                        },
                        'ModuleAcceleratorConfiguration': {
                            'createWithModuleIdentifier': instance.uno_Function_com$sun$star$ui$ModuleAcceleratorConfiguration$$createWithModuleIdentifier
                        },
                        'ModuleUIConfigurationManager': {
                            'createDefault': instance.uno_Function_com$sun$star$ui$ModuleUIConfigurationManager$$createDefault
                        },
                        'UICategoryDescription': {
                            'create': instance.uno_Function_com$sun$star$ui$UICategoryDescription$$create
                        },
                        'UIConfigurationManager': {
                            'create': instance.uno_Function_com$sun$star$ui$UIConfigurationManager$$create
                        },
                        'UIElementFactoryManager': {
                            'create': instance.uno_Function_com$sun$star$ui$UIElementFactoryManager$$create
                        },
                        'UIElementType': {
                            'COUNT': 8,
                            'DOCKINGWINDOW': 7,
                            'FLOATINGWINDOW': 5,
                            'MENUBAR': 1,
                            'POPUPMENU': 2,
                            'PROGRESSBAR': 6,
                            'STATUSBAR': 4,
                            'TOOLBAR': 3,
                            'TOOLPANEL': 7,
                            'UNKNOWN': 0
                        },
                        'WindowContentFactoryManager': {
                            'create': instance.uno_Function_com$sun$star$ui$WindowContentFactoryManager$$create
                        },
                        'WindowStateConfiguration': {
                            'create': instance.uno_Function_com$sun$star$ui$WindowStateConfiguration$$create
                        },
                        'dialogs': {
                            'DialogClosedEvent': instance.uno_Type_com$sun$star$ui$dialogs$DialogClosedEvent,
                            'ExecutableDialogException': instance.uno_Type_com$sun$star$ui$dialogs$ExecutableDialogException,
                            'FilePickerEvent': instance.uno_Type_com$sun$star$ui$dialogs$FilePickerEvent,
                            'XAsynchronousExecutableDialog': instance.uno_Type_com$sun$star$ui$dialogs$XAsynchronousExecutableDialog,
                            'XControlAccess': instance.uno_Type_com$sun$star$ui$dialogs$XControlAccess,
                            'XControlInformation': instance.uno_Type_com$sun$star$ui$dialogs$XControlInformation,
                            'XDialogClosedListener': instance.uno_Type_com$sun$star$ui$dialogs$XDialogClosedListener,
                            'XExecutableDialog': instance.uno_Type_com$sun$star$ui$dialogs$XExecutableDialog,
                            'XFilePicker': instance.uno_Type_com$sun$star$ui$dialogs$XFilePicker,
                            'XFilePicker2': instance.uno_Type_com$sun$star$ui$dialogs$XFilePicker2,
                            'XFilePicker3': instance.uno_Type_com$sun$star$ui$dialogs$XFilePicker3,
                            'XFilePickerControlAccess': instance.uno_Type_com$sun$star$ui$dialogs$XFilePickerControlAccess,
                            'XFilePickerListener': instance.uno_Type_com$sun$star$ui$dialogs$XFilePickerListener,
                            'XFilePickerNotifier': instance.uno_Type_com$sun$star$ui$dialogs$XFilePickerNotifier,
                            'XFilePreview': instance.uno_Type_com$sun$star$ui$dialogs$XFilePreview,
                            'XFilterGroupManager': instance.uno_Type_com$sun$star$ui$dialogs$XFilterGroupManager,
                            'XFilterManager': instance.uno_Type_com$sun$star$ui$dialogs$XFilterManager,
                            'XFolderPicker': instance.uno_Type_com$sun$star$ui$dialogs$XFolderPicker,
                            'XFolderPicker2': instance.uno_Type_com$sun$star$ui$dialogs$XFolderPicker2,
                            'XWizard': instance.uno_Type_com$sun$star$ui$dialogs$XWizard,
                            'XWizardController': instance.uno_Type_com$sun$star$ui$dialogs$XWizardController,
                            'XWizardPage': instance.uno_Type_com$sun$star$ui$dialogs$XWizardPage,
                            'AddressBookSourcePilot': {
                                'createWithParent': instance.uno_Function_com$sun$star$ui$dialogs$AddressBookSourcePilot$$createWithParent
                            },
                            'CommonFilePickerElementIds': {
                                'CONTROL_FILEVIEW': 4,
                                'EDIT_FILEURL': 5,
                                'EDIT_FILEURL_LABEL': 7,
                                'LISTBOX_FILTER': 3,
                                'LISTBOX_FILTER_LABEL': 6,
                                'PUSHBUTTON_CANCEL': 2,
                                'PUSHBUTTON_OK': 1
                            },
                            'ControlActions': {
                                'ADD_ITEM': 1,
                                'ADD_ITEMS': 2,
                                'DELETE_ITEM': 3,
                                'DELETE_ITEMS': 4,
                                'GET_HELP_URL': 101,
                                'GET_ITEMS': 6,
                                'GET_SELECTED_ITEM': 7,
                                'GET_SELECTED_ITEM_INDEX': 8,
                                'SET_HELP_URL': 100,
                                'SET_SELECT_ITEM': 5
                            },
                            'ExecutableDialogResults': {
                                'CANCEL': 0,
                                'OK': 1
                            },
                            'ExtendedFilePickerElementIds': {
                                'CHECKBOX_AUTOEXTENSION': 100,
                                'CHECKBOX_FILTEROPTIONS': 102,
                                'CHECKBOX_GPGENCRYPTION': 211,
                                'CHECKBOX_LINK': 104,
                                'CHECKBOX_PASSWORD': 101,
                                'CHECKBOX_PREVIEW': 105,
                                'CHECKBOX_READONLY': 103,
                                'CHECKBOX_SELECTION': 110,
                                'LISTBOX_FILTER_SELECTOR': 210,
                                'LISTBOX_IMAGE_ANCHOR': 212,
                                'LISTBOX_IMAGE_ANCHOR_LABEL': 213,
                                'LISTBOX_IMAGE_TEMPLATE': 109,
                                'LISTBOX_IMAGE_TEMPLATE_LABEL': 209,
                                'LISTBOX_TEMPLATE': 108,
                                'LISTBOX_TEMPLATE_LABEL': 208,
                                'LISTBOX_VERSION': 107,
                                'LISTBOX_VERSION_LABEL': 207,
                                'PUSHBUTTON_PLAY': 106
                            },
                            'FilePicker': {
                                'createWithMode': instance.uno_Function_com$sun$star$ui$dialogs$FilePicker$$createWithMode
                            },
                            'FilePreviewImageFormats': {
                                'BITMAP': 1
                            },
                            'FolderPicker': {
                                'create': instance.uno_Function_com$sun$star$ui$dialogs$FolderPicker$$create
                            },
                            'ListboxControlActions': {
                                'ADD_ITEM': 1,
                                'ADD_ITEMS': 2,
                                'DELETE_ITEM': 3,
                                'DELETE_ITEMS': 4,
                                'GET_ITEMS': 6,
                                'GET_SELECTED_ITEM': 7,
                                'SET_SELECT_ITEM': 5
                            },
                            'TemplateDescription': {
                                'FILEOPEN_LINK_PLAY': 12,
                                'FILEOPEN_LINK_PREVIEW': 9,
                                'FILEOPEN_LINK_PREVIEW_IMAGE_ANCHOR': 13,
                                'FILEOPEN_LINK_PREVIEW_IMAGE_TEMPLATE': 6,
                                'FILEOPEN_PLAY': 7,
                                'FILEOPEN_PREVIEW': 11,
                                'FILEOPEN_READONLY_VERSION': 8,
                                'FILEOPEN_SIMPLE': 0,
                                'FILESAVE_AUTOEXTENSION': 10,
                                'FILESAVE_AUTOEXTENSION_PASSWORD': 2,
                                'FILESAVE_AUTOEXTENSION_PASSWORD_FILTEROPTIONS': 3,
                                'FILESAVE_AUTOEXTENSION_SELECTION': 4,
                                'FILESAVE_AUTOEXTENSION_TEMPLATE': 5,
                                'FILESAVE_SIMPLE': 1
                            },
                            'Wizard': {
                                'createSinglePathWizard': instance.uno_Function_com$sun$star$ui$dialogs$Wizard$$createSinglePathWizard,
                                'createMultiplePathsWizard': instance.uno_Function_com$sun$star$ui$dialogs$Wizard$$createMultiplePathsWizard
                            },
                            'WizardButton': {
                                'CANCEL': 4,
                                'FINISH': 3,
                                'HELP': 5,
                                'NEXT': 1,
                                'NONE': 0,
                                'PREVIOUS': 2
                            },
                            'WizardTravelType': {
                                'BACKWARD': 2,
                                'FINISH': 3,
                                'FORWARD': 1
                            },
                            'XSLTFilterDialog': {
                                'create': instance.uno_Function_com$sun$star$ui$dialogs$XSLTFilterDialog$$create
                            }
                        },
                        'test': {
                            'XUIObject': instance.uno_Type_com$sun$star$ui$test$XUIObject,
                            'XUITest': instance.uno_Type_com$sun$star$ui$test$XUITest
                        }
                    },
                    'uno': {
                        'DeploymentException': instance.uno_Type_com$sun$star$uno$DeploymentException,
                        'Exception': instance.uno_Type_com$sun$star$uno$Exception,
                        'RuntimeException': instance.uno_Type_com$sun$star$uno$RuntimeException,
                        'SecurityException': instance.uno_Type_com$sun$star$uno$SecurityException,
                        'TypeClass': instance.uno_Type_com$sun$star$uno$TypeClass,
                        'Uik': instance.uno_Type_com$sun$star$uno$Uik,
                        'XAdapter': instance.uno_Type_com$sun$star$uno$XAdapter,
                        'XAggregation': instance.uno_Type_com$sun$star$uno$XAggregation,
                        'XComponentContext': instance.uno_Type_com$sun$star$uno$XComponentContext,
                        'XCurrentContext': instance.uno_Type_com$sun$star$uno$XCurrentContext,
                        'XInterface': instance.uno_Type_com$sun$star$uno$XInterface,
                        'XNamingService': instance.uno_Type_com$sun$star$uno$XNamingService,
                        'XReference': instance.uno_Type_com$sun$star$uno$XReference,
                        'XUnloadingPreference': instance.uno_Type_com$sun$star$uno$XUnloadingPreference,
                        'XWeak': instance.uno_Type_com$sun$star$uno$XWeak,
                        'NamingService': {
                            'create': instance.uno_Function_com$sun$star$uno$NamingService$$create
                        }
                    },
                    'uri': {
                        'RelativeUriExcessParentSegments': instance.uno_Type_com$sun$star$uri$RelativeUriExcessParentSegments,
                        'XExternalUriReferenceTranslator': instance.uno_Type_com$sun$star$uri$XExternalUriReferenceTranslator,
                        'XUriReference': instance.uno_Type_com$sun$star$uri$XUriReference,
                        'XUriReferenceFactory': instance.uno_Type_com$sun$star$uri$XUriReferenceFactory,
                        'XUriSchemeParser': instance.uno_Type_com$sun$star$uri$XUriSchemeParser,
                        'XVndSunStarExpandUrl': instance.uno_Type_com$sun$star$uri$XVndSunStarExpandUrl,
                        'XVndSunStarExpandUrlReference': instance.uno_Type_com$sun$star$uri$XVndSunStarExpandUrlReference,
                        'XVndSunStarPkgUrlReferenceFactory': instance.uno_Type_com$sun$star$uri$XVndSunStarPkgUrlReferenceFactory,
                        'XVndSunStarScriptUrl': instance.uno_Type_com$sun$star$uri$XVndSunStarScriptUrl,
                        'XVndSunStarScriptUrlReference': instance.uno_Type_com$sun$star$uri$XVndSunStarScriptUrlReference,
                        'ExternalUriReferenceTranslator': {
                            'create': instance.uno_Function_com$sun$star$uri$ExternalUriReferenceTranslator$$create
                        },
                        'UriReferenceFactory': {
                            'create': instance.uno_Function_com$sun$star$uri$UriReferenceFactory$$create
                        },
                        'VndSunStarPkgUrlReferenceFactory': {
                            'create': instance.uno_Function_com$sun$star$uri$VndSunStarPkgUrlReferenceFactory$$create
                        }
                    },
                    'util': {
                        'XMacroExpander': instance.uno_Type_com$sun$star$util$XMacroExpander,
                        'XVeto': instance.uno_Type_com$sun$star$util$XVeto,
                        'theMacroExpander': instance.uno_Function_com$sun$star$util$theMacroExpander,
                        'AliasProgrammaticPair': instance.uno_Type_com$sun$star$util$AliasProgrammaticPair,
                        'AtomClassRequest': instance.uno_Type_com$sun$star$util$AtomClassRequest,
                        'AtomDescription': instance.uno_Type_com$sun$star$util$AtomDescription,
                        'CellProtection': instance.uno_Type_com$sun$star$util$CellProtection,
                        'ChangesEvent': instance.uno_Type_com$sun$star$util$ChangesEvent,
                        'CloseVetoException': instance.uno_Type_com$sun$star$util$CloseVetoException,
                        'DataEditorEvent': instance.uno_Type_com$sun$star$util$DataEditorEvent,
                        'DataEditorEventType': instance.uno_Type_com$sun$star$util$DataEditorEventType,
                        'Date': instance.uno_Type_com$sun$star$util$Date,
                        'DateTime': instance.uno_Type_com$sun$star$util$DateTime,
                        'DateTimeRange': instance.uno_Type_com$sun$star$util$DateTimeRange,
                        'DateTimeWithTimezone': instance.uno_Type_com$sun$star$util$DateTimeWithTimezone,
                        'DateWithTimezone': instance.uno_Type_com$sun$star$util$DateWithTimezone,
                        'Duration': instance.uno_Type_com$sun$star$util$Duration,
                        'ElementChange': instance.uno_Type_com$sun$star$util$ElementChange,
                        'InvalidStateException': instance.uno_Type_com$sun$star$util$InvalidStateException,
                        'MalformedNumberFormatException': instance.uno_Type_com$sun$star$util$MalformedNumberFormatException,
                        'ModeChangeEvent': instance.uno_Type_com$sun$star$util$ModeChangeEvent,
                        'NotLockedException': instance.uno_Type_com$sun$star$util$NotLockedException,
                        'NotNumericException': instance.uno_Type_com$sun$star$util$NotNumericException,
                        'RevisionTag': instance.uno_Type_com$sun$star$util$RevisionTag,
                        'SearchAlgorithms': instance.uno_Type_com$sun$star$util$SearchAlgorithms,
                        'SearchOptions': instance.uno_Type_com$sun$star$util$SearchOptions,
                        'SearchOptions2': instance.uno_Type_com$sun$star$util$SearchOptions2,
                        'SearchResult': instance.uno_Type_com$sun$star$util$SearchResult,
                        'SortField': instance.uno_Type_com$sun$star$util$SortField,
                        'SortFieldType': instance.uno_Type_com$sun$star$util$SortFieldType,
                        'Time': instance.uno_Type_com$sun$star$util$Time,
                        'TimeWithTimezone': instance.uno_Type_com$sun$star$util$TimeWithTimezone,
                        'TriState': instance.uno_Type_com$sun$star$util$TriState,
                        'URL': instance.uno_Type_com$sun$star$util$URL,
                        'VetoException': instance.uno_Type_com$sun$star$util$VetoException,
                        'XAccounting': instance.uno_Type_com$sun$star$util$XAccounting,
                        'XAtomServer': instance.uno_Type_com$sun$star$util$XAtomServer,
                        'XBinaryDataContainer': instance.uno_Type_com$sun$star$util$XBinaryDataContainer,
                        'XBroadcaster': instance.uno_Type_com$sun$star$util$XBroadcaster,
                        'XCacheInfo': instance.uno_Type_com$sun$star$util$XCacheInfo,
                        'XCancellable': instance.uno_Type_com$sun$star$util$XCancellable,
                        'XChainable': instance.uno_Type_com$sun$star$util$XChainable,
                        'XChangesBatch': instance.uno_Type_com$sun$star$util$XChangesBatch,
                        'XChangesListener': instance.uno_Type_com$sun$star$util$XChangesListener,
                        'XChangesNotifier': instance.uno_Type_com$sun$star$util$XChangesNotifier,
                        'XChangesSet': instance.uno_Type_com$sun$star$util$XChangesSet,
                        'XCloneable': instance.uno_Type_com$sun$star$util$XCloneable,
                        'XCloseBroadcaster': instance.uno_Type_com$sun$star$util$XCloseBroadcaster,
                        'XCloseListener': instance.uno_Type_com$sun$star$util$XCloseListener,
                        'XCloseable': instance.uno_Type_com$sun$star$util$XCloseable,
                        'XComplexColor': instance.uno_Type_com$sun$star$util$XComplexColor,
                        'XDataEditor': instance.uno_Type_com$sun$star$util$XDataEditor,
                        'XDataEditorListener': instance.uno_Type_com$sun$star$util$XDataEditorListener,
                        'XFlushListener': instance.uno_Type_com$sun$star$util$XFlushListener,
                        'XFlushable': instance.uno_Type_com$sun$star$util$XFlushable,
                        'XImportable': instance.uno_Type_com$sun$star$util$XImportable,
                        'XIndent': instance.uno_Type_com$sun$star$util$XIndent,
                        'XJobManager': instance.uno_Type_com$sun$star$util$XJobManager,
                        'XLinkUpdate': instance.uno_Type_com$sun$star$util$XLinkUpdate,
                        'XLocalizedAliases': instance.uno_Type_com$sun$star$util$XLocalizedAliases,
                        'XLockable': instance.uno_Type_com$sun$star$util$XLockable,
                        'XMergeable': instance.uno_Type_com$sun$star$util$XMergeable,
                        'XModeChangeApproveListener': instance.uno_Type_com$sun$star$util$XModeChangeApproveListener,
                        'XModeChangeBroadcaster': instance.uno_Type_com$sun$star$util$XModeChangeBroadcaster,
                        'XModeChangeListener': instance.uno_Type_com$sun$star$util$XModeChangeListener,
                        'XModeSelector': instance.uno_Type_com$sun$star$util$XModeSelector,
                        'XModifiable': instance.uno_Type_com$sun$star$util$XModifiable,
                        'XModifiable2': instance.uno_Type_com$sun$star$util$XModifiable2,
                        'XModifyBroadcaster': instance.uno_Type_com$sun$star$util$XModifyBroadcaster,
                        'XModifyListener': instance.uno_Type_com$sun$star$util$XModifyListener,
                        'XNumberFormatPreviewer': instance.uno_Type_com$sun$star$util$XNumberFormatPreviewer,
                        'XNumberFormatTypes': instance.uno_Type_com$sun$star$util$XNumberFormatTypes,
                        'XNumberFormats': instance.uno_Type_com$sun$star$util$XNumberFormats,
                        'XNumberFormatsSupplier': instance.uno_Type_com$sun$star$util$XNumberFormatsSupplier,
                        'XNumberFormatter': instance.uno_Type_com$sun$star$util$XNumberFormatter,
                        'XNumberFormatter2': instance.uno_Type_com$sun$star$util$XNumberFormatter2,
                        'XOfficeInstallationDirectories': instance.uno_Type_com$sun$star$util$XOfficeInstallationDirectories,
                        'XPathSettings': instance.uno_Type_com$sun$star$util$XPathSettings,
                        'XPropertyReplace': instance.uno_Type_com$sun$star$util$XPropertyReplace,
                        'XProtectable': instance.uno_Type_com$sun$star$util$XProtectable,
                        'XRefreshListener': instance.uno_Type_com$sun$star$util$XRefreshListener,
                        'XRefreshable': instance.uno_Type_com$sun$star$util$XRefreshable,
                        'XReplaceDescriptor': instance.uno_Type_com$sun$star$util$XReplaceDescriptor,
                        'XReplaceable': instance.uno_Type_com$sun$star$util$XReplaceable,
                        'XSearchDescriptor': instance.uno_Type_com$sun$star$util$XSearchDescriptor,
                        'XSearchable': instance.uno_Type_com$sun$star$util$XSearchable,
                        'XSortable': instance.uno_Type_com$sun$star$util$XSortable,
                        'XStringAbbreviation': instance.uno_Type_com$sun$star$util$XStringAbbreviation,
                        'XStringEscape': instance.uno_Type_com$sun$star$util$XStringEscape,
                        'XStringMapping': instance.uno_Type_com$sun$star$util$XStringMapping,
                        'XStringSubstitution': instance.uno_Type_com$sun$star$util$XStringSubstitution,
                        'XStringWidth': instance.uno_Type_com$sun$star$util$XStringWidth,
                        'XTextSearch': instance.uno_Type_com$sun$star$util$XTextSearch,
                        'XTextSearch2': instance.uno_Type_com$sun$star$util$XTextSearch2,
                        'XTheme': instance.uno_Type_com$sun$star$util$XTheme,
                        'XTimeStamped': instance.uno_Type_com$sun$star$util$XTimeStamped,
                        'XURLTransformer': instance.uno_Type_com$sun$star$util$XURLTransformer,
                        'XUniqueIDFactory': instance.uno_Type_com$sun$star$util$XUniqueIDFactory,
                        'XUpdatable': instance.uno_Type_com$sun$star$util$XUpdatable,
                        'XUpdatable2': instance.uno_Type_com$sun$star$util$XUpdatable2,
                        'theOfficeInstallationDirectories': instance.uno_Function_com$sun$star$util$theOfficeInstallationDirectories,
                        'thePathSettings': instance.uno_Function_com$sun$star$util$thePathSettings,
                        'Endianness': {
                            'BIG': 1,
                            'LITTLE': 0
                        },
                        'JobManager': {
                            'create': instance.uno_Function_com$sun$star$util$JobManager$$create
                        },
                        'MeasureUnit': {
                            'APPFONT': 17,
                            'CM': 3,
                            'FOOT': 13,
                            'INCH': 7,
                            'INCH_1000TH': 4,
                            'INCH_100TH': 5,
                            'INCH_10TH': 6,
                            'KM': 11,
                            'M': 10,
                            'MILE': 14,
                            'MM': 2,
                            'MM_100TH': 0,
                            'MM_10TH': 1,
                            'PERCENT': 15,
                            'PICA': 12,
                            'PIXEL': 16,
                            'POINT': 8,
                            'SYSFONT': 18,
                            'TWIP': 9
                        },
                        'NumberFormat': {
                            'ALL': 0,
                            'CURRENCY': 8,
                            'DATE': 2,
                            'DATETIME': 6,
                            'DEFINED': 1,
                            'DURATION': 8196,
                            'EMPTY': 4096,
                            'FRACTION': 64,
                            'LOGICAL': 1024,
                            'NUMBER': 16,
                            'PERCENT': 128,
                            'SCIENTIFIC': 32,
                            'TEXT': 256,
                            'TIME': 4,
                            'UNDEFINED': 2048
                        },
                        'NumberFormatsSupplier': {
                            'createWithLocale': instance.uno_Function_com$sun$star$util$NumberFormatsSupplier$$createWithLocale,
                            'createWithDefaultLocale': instance.uno_Function_com$sun$star$util$NumberFormatsSupplier$$createWithDefaultLocale
                        },
                        'NumberFormatter': {
                            'create': instance.uno_Function_com$sun$star$util$NumberFormatter$$create
                        },
                        'PathSettings': {
                            'create': instance.uno_Function_com$sun$star$util$PathSettings$$create
                        },
                        'PathSubstitution': {
                            'create': instance.uno_Function_com$sun$star$util$PathSubstitution$$create
                        },
                        'SearchAlgorithms2': {
                            'ABSOLUTE': 1,
                            'APPROXIMATE': 3,
                            'REGEXP': 2,
                            'WILDCARD': 4
                        },
                        'SearchFlags': {
                            'ALL_IGNORE_CASE': 1,
                            'LEV_RELAXED': 65536,
                            'NORM_WORD_ONLY': 16,
                            'REG_EXTENDED': 256,
                            'REG_NEWLINE': 1024,
                            'REG_NOSUB': 512,
                            'REG_NOT_BEGINOFLINE': 2048,
                            'REG_NOT_ENDOFLINE': 4096,
                            'WILD_MATCH_SELECTION': 1048576
                        },
                        'TextSearch': {
                            'create': instance.uno_Function_com$sun$star$util$TextSearch$$create
                        },
                        'TextSearch2': {
                            'create': instance.uno_Function_com$sun$star$util$TextSearch2$$create
                        },
                        'URLTransformer': {
                            'create': instance.uno_Function_com$sun$star$util$URLTransformer$$create
                        },
                        'UriAbbreviation': {
                            'create': instance.uno_Function_com$sun$star$util$UriAbbreviation$$create
                        }
                    },
                    'view': {
                        'PaperFormat': instance.uno_Type_com$sun$star$view$PaperFormat,
                        'PaperOrientation': instance.uno_Type_com$sun$star$view$PaperOrientation,
                        'PrintJobEvent': instance.uno_Type_com$sun$star$view$PrintJobEvent,
                        'PrintableState': instance.uno_Type_com$sun$star$view$PrintableState,
                        'PrintableStateEvent': instance.uno_Type_com$sun$star$view$PrintableStateEvent,
                        'SelectionType': instance.uno_Type_com$sun$star$view$SelectionType,
                        'XControlAccess': instance.uno_Type_com$sun$star$view$XControlAccess,
                        'XFormLayerAccess': instance.uno_Type_com$sun$star$view$XFormLayerAccess,
                        'XLineCursor': instance.uno_Type_com$sun$star$view$XLineCursor,
                        'XMultiSelectionSupplier': instance.uno_Type_com$sun$star$view$XMultiSelectionSupplier,
                        'XPrintJob': instance.uno_Type_com$sun$star$view$XPrintJob,
                        'XPrintJobBroadcaster': instance.uno_Type_com$sun$star$view$XPrintJobBroadcaster,
                        'XPrintJobListener': instance.uno_Type_com$sun$star$view$XPrintJobListener,
                        'XPrintSettingsSupplier': instance.uno_Type_com$sun$star$view$XPrintSettingsSupplier,
                        'XPrintable': instance.uno_Type_com$sun$star$view$XPrintable,
                        'XPrintableBroadcaster': instance.uno_Type_com$sun$star$view$XPrintableBroadcaster,
                        'XPrintableListener': instance.uno_Type_com$sun$star$view$XPrintableListener,
                        'XRenderable': instance.uno_Type_com$sun$star$view$XRenderable,
                        'XScreenCursor': instance.uno_Type_com$sun$star$view$XScreenCursor,
                        'XSelectionChangeListener': instance.uno_Type_com$sun$star$view$XSelectionChangeListener,
                        'XSelectionSupplier': instance.uno_Type_com$sun$star$view$XSelectionSupplier,
                        'XViewCursor': instance.uno_Type_com$sun$star$view$XViewCursor,
                        'XViewSettingsSupplier': instance.uno_Type_com$sun$star$view$XViewSettingsSupplier,
                        'DocumentZoomType': {
                            'BY_VALUE': 3,
                            'ENTIRE_PAGE': 2,
                            'OPTIMAL': 0,
                            'PAGE_WIDTH': 1,
                            'PAGE_WIDTH_EXACT': 4
                        },
                        'DuplexMode': {
                            'LONGEDGE': 2,
                            'OFF': 1,
                            'SHORTEDGE': 3,
                            'UNKNOWN': 0
                        }
                    },
                    'xforms': {
                        'InvalidDataOnSubmitException': instance.uno_Type_com$sun$star$xforms$InvalidDataOnSubmitException,
                        'XDataTypeRepository': instance.uno_Type_com$sun$star$xforms$XDataTypeRepository,
                        'XFormsEvent': instance.uno_Type_com$sun$star$xforms$XFormsEvent,
                        'XFormsSupplier': instance.uno_Type_com$sun$star$xforms$XFormsSupplier,
                        'XFormsUIHelper1': instance.uno_Type_com$sun$star$xforms$XFormsUIHelper1,
                        'XModel': instance.uno_Type_com$sun$star$xforms$XModel,
                        'XModel2': instance.uno_Type_com$sun$star$xforms$XModel2,
                        'XSubmission': instance.uno_Type_com$sun$star$xforms$XSubmission,
                        'Model': {
                            'create': instance.uno_Function_com$sun$star$xforms$Model$$create
                        },
                        'XForms': {
                            'create': instance.uno_Function_com$sun$star$xforms$XForms$$create
                        }
                    },
                    'xml': {
                        'Attribute': instance.uno_Type_com$sun$star$xml$Attribute,
                        'AttributeData': instance.uno_Type_com$sun$star$xml$AttributeData,
                        'FastAttribute': instance.uno_Type_com$sun$star$xml$FastAttribute,
                        'XExportFilter': instance.uno_Type_com$sun$star$xml$XExportFilter,
                        'XImportFilter': instance.uno_Type_com$sun$star$xml$XImportFilter,
                        'XImportFilter2': instance.uno_Type_com$sun$star$xml$XImportFilter2,
                        'crypto': {
                            'NSSProfile': instance.uno_Type_com$sun$star$xml$crypto$NSSProfile,
                            'SecurityOperationStatus': instance.uno_Type_com$sun$star$xml$crypto$SecurityOperationStatus,
                            'XCertificateCreator': instance.uno_Type_com$sun$star$xml$crypto$XCertificateCreator,
                            'XCipherContext': instance.uno_Type_com$sun$star$xml$crypto$XCipherContext,
                            'XCipherContextSupplier': instance.uno_Type_com$sun$star$xml$crypto$XCipherContextSupplier,
                            'XDigestContext': instance.uno_Type_com$sun$star$xml$crypto$XDigestContext,
                            'XDigestContextSupplier': instance.uno_Type_com$sun$star$xml$crypto$XDigestContextSupplier,
                            'XMLEncryptionException': instance.uno_Type_com$sun$star$xml$crypto$XMLEncryptionException,
                            'XMLSignatureException': instance.uno_Type_com$sun$star$xml$crypto$XMLSignatureException,
                            'XNSSInitializer': instance.uno_Type_com$sun$star$xml$crypto$XNSSInitializer,
                            'XSEInitializer': instance.uno_Type_com$sun$star$xml$crypto$XSEInitializer,
                            'XSecurityEnvironment': instance.uno_Type_com$sun$star$xml$crypto$XSecurityEnvironment,
                            'XUriBinding': instance.uno_Type_com$sun$star$xml$crypto$XUriBinding,
                            'XXMLEncryption': instance.uno_Type_com$sun$star$xml$crypto$XXMLEncryption,
                            'XXMLEncryptionTemplate': instance.uno_Type_com$sun$star$xml$crypto$XXMLEncryptionTemplate,
                            'XXMLSecurityContext': instance.uno_Type_com$sun$star$xml$crypto$XXMLSecurityContext,
                            'XXMLSecurityTemplate': instance.uno_Type_com$sun$star$xml$crypto$XXMLSecurityTemplate,
                            'XXMLSignature': instance.uno_Type_com$sun$star$xml$crypto$XXMLSignature,
                            'XXMLSignatureTemplate': instance.uno_Type_com$sun$star$xml$crypto$XXMLSignatureTemplate,
                            'CipherID': {
                                'AES_CBC_W3C_PADDING': 1,
                                'AES_GCM_W3C': 3,
                                'BLOWFISH_CFB_8': 2
                            },
                            'DigestID': {
                                'SHA1': 1,
                                'SHA1_1K': 3,
                                'SHA256': 2,
                                'SHA256_1K': 4,
                                'SHA512': 5,
                                'SHA512_1K': 6
                            },
                            'GPGSEInitializer': {
                                'create': instance.uno_Function_com$sun$star$xml$crypto$GPGSEInitializer$$create
                            },
                            'KDFID': {
                                'Argon2id': 3,
                                'PBKDF2': 1,
                                'PGP_RSA_OAEP_MGF1P': 2
                            },
                            'NSSInitializer': {
                                'create': instance.uno_Function_com$sun$star$xml$crypto$NSSInitializer$$create
                            },
                            'SEInitializer': {
                                'create': instance.uno_Function_com$sun$star$xml$crypto$SEInitializer$$create
                            },
                            'SecurityEnvironment': {
                                'create': instance.uno_Function_com$sun$star$xml$crypto$SecurityEnvironment$$create
                            },
                            'XMLSecurityContext': {
                                'create': instance.uno_Function_com$sun$star$xml$crypto$XMLSecurityContext$$create
                            },
                            'sax': {
                                'ElementMarkPriority': instance.uno_Type_com$sun$star$xml$crypto$sax$ElementMarkPriority,
                                'ElementMarkType': instance.uno_Type_com$sun$star$xml$crypto$sax$ElementMarkType,
                                'ElementStackItem': instance.uno_Type_com$sun$star$xml$crypto$sax$ElementStackItem,
                                'XBlockerMonitor': instance.uno_Type_com$sun$star$xml$crypto$sax$XBlockerMonitor,
                                'XDecryptionResultBroadcaster': instance.uno_Type_com$sun$star$xml$crypto$sax$XDecryptionResultBroadcaster,
                                'XDecryptionResultListener': instance.uno_Type_com$sun$star$xml$crypto$sax$XDecryptionResultListener,
                                'XElementStackKeeper': instance.uno_Type_com$sun$star$xml$crypto$sax$XElementStackKeeper,
                                'XEncryptionResultBroadcaster': instance.uno_Type_com$sun$star$xml$crypto$sax$XEncryptionResultBroadcaster,
                                'XEncryptionResultListener': instance.uno_Type_com$sun$star$xml$crypto$sax$XEncryptionResultListener,
                                'XKeyCollector': instance.uno_Type_com$sun$star$xml$crypto$sax$XKeyCollector,
                                'XMissionTaker': instance.uno_Type_com$sun$star$xml$crypto$sax$XMissionTaker,
                                'XReferenceCollector': instance.uno_Type_com$sun$star$xml$crypto$sax$XReferenceCollector,
                                'XReferenceResolvedBroadcaster': instance.uno_Type_com$sun$star$xml$crypto$sax$XReferenceResolvedBroadcaster,
                                'XReferenceResolvedListener': instance.uno_Type_com$sun$star$xml$crypto$sax$XReferenceResolvedListener,
                                'XSAXEventKeeper': instance.uno_Type_com$sun$star$xml$crypto$sax$XSAXEventKeeper,
                                'XSAXEventKeeperStatusChangeBroadcaster': instance.uno_Type_com$sun$star$xml$crypto$sax$XSAXEventKeeperStatusChangeBroadcaster,
                                'XSAXEventKeeperStatusChangeListener': instance.uno_Type_com$sun$star$xml$crypto$sax$XSAXEventKeeperStatusChangeListener,
                                'XSecuritySAXEventKeeper': instance.uno_Type_com$sun$star$xml$crypto$sax$XSecuritySAXEventKeeper,
                                'XSignatureCreationResultBroadcaster': instance.uno_Type_com$sun$star$xml$crypto$sax$XSignatureCreationResultBroadcaster,
                                'XSignatureCreationResultListener': instance.uno_Type_com$sun$star$xml$crypto$sax$XSignatureCreationResultListener,
                                'XSignatureVerifyResultBroadcaster': instance.uno_Type_com$sun$star$xml$crypto$sax$XSignatureVerifyResultBroadcaster,
                                'XSignatureVerifyResultListener': instance.uno_Type_com$sun$star$xml$crypto$sax$XSignatureVerifyResultListener,
                                'ConstOfSecurityId': {
                                    'UNDEFINEDSECURITYID': -1
                                }
                            }
                        },
                        'csax': {
                            'XCompressedDocumentHandler': instance.uno_Type_com$sun$star$xml$csax$XCompressedDocumentHandler,
                            'XMLAttribute': instance.uno_Type_com$sun$star$xml$csax$XMLAttribute
                        },
                        'dom': {
                            'DOMException': instance.uno_Type_com$sun$star$xml$dom$DOMException,
                            'DOMExceptionType': instance.uno_Type_com$sun$star$xml$dom$DOMExceptionType,
                            'NodeType': instance.uno_Type_com$sun$star$xml$dom$NodeType,
                            'SAXDocumentBuilderState': instance.uno_Type_com$sun$star$xml$dom$SAXDocumentBuilderState,
                            'XAttr': instance.uno_Type_com$sun$star$xml$dom$XAttr,
                            'XCDATASection': instance.uno_Type_com$sun$star$xml$dom$XCDATASection,
                            'XCharacterData': instance.uno_Type_com$sun$star$xml$dom$XCharacterData,
                            'XComment': instance.uno_Type_com$sun$star$xml$dom$XComment,
                            'XDOMImplementation': instance.uno_Type_com$sun$star$xml$dom$XDOMImplementation,
                            'XDocument': instance.uno_Type_com$sun$star$xml$dom$XDocument,
                            'XDocumentBuilder': instance.uno_Type_com$sun$star$xml$dom$XDocumentBuilder,
                            'XDocumentFragment': instance.uno_Type_com$sun$star$xml$dom$XDocumentFragment,
                            'XDocumentType': instance.uno_Type_com$sun$star$xml$dom$XDocumentType,
                            'XElement': instance.uno_Type_com$sun$star$xml$dom$XElement,
                            'XEntity': instance.uno_Type_com$sun$star$xml$dom$XEntity,
                            'XEntityReference': instance.uno_Type_com$sun$star$xml$dom$XEntityReference,
                            'XNamedNodeMap': instance.uno_Type_com$sun$star$xml$dom$XNamedNodeMap,
                            'XNode': instance.uno_Type_com$sun$star$xml$dom$XNode,
                            'XNodeList': instance.uno_Type_com$sun$star$xml$dom$XNodeList,
                            'XNotation': instance.uno_Type_com$sun$star$xml$dom$XNotation,
                            'XProcessingInstruction': instance.uno_Type_com$sun$star$xml$dom$XProcessingInstruction,
                            'XSAXDocumentBuilder': instance.uno_Type_com$sun$star$xml$dom$XSAXDocumentBuilder,
                            'XSAXDocumentBuilder2': instance.uno_Type_com$sun$star$xml$dom$XSAXDocumentBuilder2,
                            'XText': instance.uno_Type_com$sun$star$xml$dom$XText,
                            'DocumentBuilder': {
                                'create': instance.uno_Function_com$sun$star$xml$dom$DocumentBuilder$$create
                            },
                            'SAXDocumentBuilder': {
                                'create': instance.uno_Function_com$sun$star$xml$dom$SAXDocumentBuilder$$create
                            },
                            'events': {
                                'AttrChangeType': instance.uno_Type_com$sun$star$xml$dom$events$AttrChangeType,
                                'EventException': instance.uno_Type_com$sun$star$xml$dom$events$EventException,
                                'EventType': instance.uno_Type_com$sun$star$xml$dom$events$EventType,
                                'PhaseType': instance.uno_Type_com$sun$star$xml$dom$events$PhaseType,
                                'XDocumentEvent': instance.uno_Type_com$sun$star$xml$dom$events$XDocumentEvent,
                                'XEvent': instance.uno_Type_com$sun$star$xml$dom$events$XEvent,
                                'XEventListener': instance.uno_Type_com$sun$star$xml$dom$events$XEventListener,
                                'XEventTarget': instance.uno_Type_com$sun$star$xml$dom$events$XEventTarget,
                                'XMouseEvent': instance.uno_Type_com$sun$star$xml$dom$events$XMouseEvent,
                                'XMutationEvent': instance.uno_Type_com$sun$star$xml$dom$events$XMutationEvent,
                                'XUIEvent': instance.uno_Type_com$sun$star$xml$dom$events$XUIEvent
                            },
                            'views': {
                                'XAbstractView': instance.uno_Type_com$sun$star$xml$dom$views$XAbstractView,
                                'XDocumentView': instance.uno_Type_com$sun$star$xml$dom$views$XDocumentView
                            }
                        },
                        'input': {
                            'XAttributes': instance.uno_Type_com$sun$star$xml$input$XAttributes,
                            'XElement': instance.uno_Type_com$sun$star$xml$input$XElement,
                            'XNamespaceMapping': instance.uno_Type_com$sun$star$xml$input$XNamespaceMapping,
                            'XRoot': instance.uno_Type_com$sun$star$xml$input$XRoot
                        },
                        'sax': {
                            'InputSource': instance.uno_Type_com$sun$star$xml$sax$InputSource,
                            'SAXException': instance.uno_Type_com$sun$star$xml$sax$SAXException,
                            'SAXInvalidCharacterException': instance.uno_Type_com$sun$star$xml$sax$SAXInvalidCharacterException,
                            'SAXParseException': instance.uno_Type_com$sun$star$xml$sax$SAXParseException,
                            'XAttributeList': instance.uno_Type_com$sun$star$xml$sax$XAttributeList,
                            'XDTDHandler': instance.uno_Type_com$sun$star$xml$sax$XDTDHandler,
                            'XDocumentHandler': instance.uno_Type_com$sun$star$xml$sax$XDocumentHandler,
                            'XEntityResolver': instance.uno_Type_com$sun$star$xml$sax$XEntityResolver,
                            'XErrorHandler': instance.uno_Type_com$sun$star$xml$sax$XErrorHandler,
                            'XExtendedDocumentHandler': instance.uno_Type_com$sun$star$xml$sax$XExtendedDocumentHandler,
                            'XFastAttributeList': instance.uno_Type_com$sun$star$xml$sax$XFastAttributeList,
                            'XFastContextHandler': instance.uno_Type_com$sun$star$xml$sax$XFastContextHandler,
                            'XFastDocumentHandler': instance.uno_Type_com$sun$star$xml$sax$XFastDocumentHandler,
                            'XFastNamespaceHandler': instance.uno_Type_com$sun$star$xml$sax$XFastNamespaceHandler,
                            'XFastParser': instance.uno_Type_com$sun$star$xml$sax$XFastParser,
                            'XFastSAXSerializable': instance.uno_Type_com$sun$star$xml$sax$XFastSAXSerializable,
                            'XFastTokenHandler': instance.uno_Type_com$sun$star$xml$sax$XFastTokenHandler,
                            'XLocator': instance.uno_Type_com$sun$star$xml$sax$XLocator,
                            'XParser': instance.uno_Type_com$sun$star$xml$sax$XParser,
                            'XSAXSerializable': instance.uno_Type_com$sun$star$xml$sax$XSAXSerializable,
                            'XWriter': instance.uno_Type_com$sun$star$xml$sax$XWriter,
                            'FastParser': {
                                'create': instance.uno_Function_com$sun$star$xml$sax$FastParser$$create
                            },
                            'FastToken': {
                                'DONTKNOW': -1,
                                'NAMESPACE': 65536
                            },
                            'FastTokenHandler': {
                                'create': instance.uno_Function_com$sun$star$xml$sax$FastTokenHandler$$create
                            },
                            'Parser': {
                                'create': instance.uno_Function_com$sun$star$xml$sax$Parser$$create
                            },
                            'Writer': {
                                'create': instance.uno_Function_com$sun$star$xml$sax$Writer$$create
                            }
                        },
                        'wrapper': {
                            'XXMLDocumentWrapper': instance.uno_Type_com$sun$star$xml$wrapper$XXMLDocumentWrapper,
                            'XXMLElementWrapper': instance.uno_Type_com$sun$star$xml$wrapper$XXMLElementWrapper
                        },
                        'xpath': {
                            'Libxml2ExtensionHandle': instance.uno_Type_com$sun$star$xml$xpath$Libxml2ExtensionHandle,
                            'XPathException': instance.uno_Type_com$sun$star$xml$xpath$XPathException,
                            'XPathObjectType': instance.uno_Type_com$sun$star$xml$xpath$XPathObjectType,
                            'XXPathAPI': instance.uno_Type_com$sun$star$xml$xpath$XXPathAPI,
                            'XXPathExtension': instance.uno_Type_com$sun$star$xml$xpath$XXPathExtension,
                            'XXPathObject': instance.uno_Type_com$sun$star$xml$xpath$XXPathObject,
                            'XPathAPI': {
                                'create': instance.uno_Function_com$sun$star$xml$xpath$XPathAPI$$create
                            },
                            'XPathExtension': {
                                'createWithModel': instance.uno_Function_com$sun$star$xml$xpath$XPathExtension$$createWithModel
                            }
                        },
                        'xslt': {
                            'XXSLTTransformer': instance.uno_Type_com$sun$star$xml$xslt$XXSLTTransformer,
                            'XSLTTransformer': {
                                'create': instance.uno_Function_com$sun$star$xml$xslt$XSLTTransformer$$create
                            }
                        }
                    },
                    'xsd': {
                        'XDataType': instance.uno_Type_com$sun$star$xsd$XDataType,
                        'DataTypeClass': {
                            'BOOLEAN': 2,
                            'DATE': 9,
                            'DATETIME': 7,
                            'DECIMAL': 3,
                            'DOUBLE': 5,
                            'DURATION': 6,
                            'FLOAT': 4,
                            'NOTATION': 19,
                            'QName': 18,
                            'STRING': 1,
                            'TIME': 8,
                            'anyURI': 17,
                            'base64Binary': 16,
                            'gDay': 13,
                            'gMonth': 14,
                            'gMonthDay': 12,
                            'gYear': 11,
                            'gYearMonth': 10,
                            'hexBinary': 15
                        },
                        'WhiteSpaceTreatment': {
                            'Collapse': 2,
                            'Preserve': 0,
                            'Replace': 1
                        }
                    }
                }
            }
        },
        'org': {
            'freedesktop': {
                'PackageKit': {
                    'XModify': instance.uno_Type_org$freedesktop$PackageKit$XModify,
                    'XQuery': instance.uno_Type_org$freedesktop$PackageKit$XQuery,
                    'XSyncDbusSessionHelper': instance.uno_Type_org$freedesktop$PackageKit$XSyncDbusSessionHelper,
                    'SyncDbusSessionHelper': {
                        'create': instance.uno_Function_org$freedesktop$PackageKit$SyncDbusSessionHelper$$create
                    }
                }
            }
        }
    };
};
