import os, sys
import re

import cv2, pytesseract

class MTGO_OCR():

    # Check for pytesseract binary
    if os.path.exists('C:\\Program Files\\Tesseract-OCR'):
        pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
    elif os.path.exists('C:\\Program Files (x86)\\Tesseract-OCR'):
        pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe'
    else: sys.exit(f"Tesseract-OCR binary not installed.")

    def __init__(self, path):
        self.original = cv2.bitwise_not(cv2.imread(path))
        self.height, self.width, self.channels = self.original.shape
        self.grey = cv2.cvtColor(self.original, cv2.COLOR_BGR2GRAY)

    def cropTitleBar(self):
        offset_w = 200 # MTGO logo width
        return self.grey[:25, offset_w:self.width-75]

    def cropTournamentPanel(self):
        offset_h = 300 # Min height for event details
        panel_w = 215 # Tournament panel width
        return self.grey[25+offset_h:, :panel_w]

    def cropDecklistPanel(self, event_type):
        if event_type == 1:
            offset_h = 90
            offset_w = self.width-60
            return self.grey[offset_h:offset_h+75, offset_w-225:offset_w]
        elif event_type == 0:
            offset_h = 90+250
            offset_w = 675
            return self.grey[offset_h:offset_h+75, offset_w-200:offset_w]

    @staticmethod
    def getOCRString(self, config='--oem 3 --psm 6'):
        return pytesseract.image_to_string(self,
            config = config)\
            .replace('/\n|\r/g', '')\
            .lstrip()

    def getTitleBarInfo(self, withPanel=False):
        def getPatternMatch(self, pattern, idx=0):
            if pattern in self:
                return int(re.findall('(?<='+str(pattern)+')(\d.*?)(?=\s)', self)[idx]) if pattern in self else None
            else: return None

        self.title_bar_text = re.sub('[^a-z|A-Z|0-9|\(|\)|\s]*(?=.*\:)', '', self.getOCRString(self.cropTitleBar()))
        self.match_id = getPatternMatch(self.title_bar_text, 'Match # ')
        self.game_id = getPatternMatch(self.title_bar_text, 'Game # ')

        if 'League #' in self.title_bar_text:
            self.event_id = getPatternMatch(self.title_bar_text, 'League # ')
            self.match_n = getPatternMatch(self.title_bar_text, 'Stage \d - Match ')

        elif 'Event #' in self.title_bar_text:
            self.event_id = getPatternMatch(self.title_bar_text, 'Event # ')
            if withPanel == True:
                self.tournament_panel_text = re.sub('\s+',' ',self.getOCRString(
                    self.cropTournamentPanel(), config = '--oem 3 --psm 4'
                ))
                if 'RETURN TO GAME.' in self.tournament_panel_text:
                    self.tournament_panel_text = self.tournament_panel_text[:-16]
                self.match_n = getPatternMatch(self.tournament_panel_text, 'Round: ')
                self.players = int(re.findall(r'[0-9]+', self.getOCRString(self.grey[25:50, 215:500]))[0])

        return self
