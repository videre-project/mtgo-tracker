import os, sys
import re

import cv2, pytesseract

from argv import getArgv
from ocr import MTGO_OCR

# Flags set by command-line arguments
GET = getArgv("get", None)
if "--game_window" in sys.argv: WINDOW_TYPE = "game_window"
elif "--main_window" in sys.argv: WINDOW_TYPE = "main_window"
elif "--event_window" in sys.argv: WINDOW_TYPE = "event_window"
else: WINDOW_TYPE = None
LEVEL = int(getArgv(f"--{WINDOW_TYPE}", 0))
PATH = getArgv("path", None)

if (GET and os.path.exists(PATH)):
    image = MTGO_OCR(PATH)
    data = {}

    if GET == 'ocr_string':
        data['text'] = image.getOCRString(image.grey)

    elif (GET == 'decklist_name' and LEVEL):
        deck_panel = image.cropDecklistPanel(LEVEL)
        data['decklist_name'] = image.getOCRString(deck_panel)

    elif GET == 'title_bar_info':
        title_bar = image.getTitleBarInfo(
            withPanel = True if WINDOW_TYPE == 'event_window' else False
        )
        data['event_id'] = title_bar.event_id if hasattr(title_bar, 'event_id') else None
        data['match_#'] = title_bar.match_n if hasattr(title_bar, 'match_n') else None
        data['match_id'] = title_bar.match_id if hasattr(title_bar, 'match_id') else None

        window_title = title_bar.title_bar_text.strip()

        if WINDOW_TYPE == 'game_window':
            data['game_id'] = title_bar.game_id if hasattr(title_bar, 'game_id') else None
            if (data['match_id'] and data['game_id']):
                window_title = window_title[:len(window_title)-len(f" - Game # {data['game_id']}")]
        elif WINDOW_TYPE == 'event_window':
            data['player_#'] = title_bar.players if hasattr(title_bar, 'players') else None

        data['text'] = title_bar.title_bar_text.strip()

        if (data['match_id'] and 'Match #' in window_title):
            window_title = window_title[:len(window_title)-len(f" Match # {data['match_id']}")]
        if (data['event_id'] and 'League #' in window_title):
            window_title = window_title[:len(window_title)-len(f"League # {data['event_id']} - ")]
        elif (data['event_id'] and 'Event #' in window_title):
            window_title = window_title[:len(window_title)-len(f"Event # {data['event_id']} - ")]

    print(str(data)); sys.stdout.flush()
