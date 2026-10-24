"""Nova Airis — interface desktop Python/PySide6."""
import sys
from datetime import datetime
from PySide6.QtCore import Qt, QTimer, QThread, Signal, QRectF
from PySide6.QtGui import QColor, QFont, QPainter, QPen, QRadialGradient
from PySide6.QtWidgets import QApplication, QFrame, QHBoxLayout, QLabel, QLineEdit, QMainWindow, QPushButton, QScrollArea, QVBoxLayout, QWidget
from airis.ai_service import chat

BG="#080d16"; PANEL="#0e1724"; PANEL2="#111e2d"; LINE="#203449"; TEXT="#e8f2ff"; MUTED="#8195ab"; CYAN="#52e6f2"

class ChatWorker(QThread):
    completed = Signal(str)
    failed = Signal(str)
    def __init__(self, messages):
        super().__init__(); self.messages = messages
    def run(self):
        try: self.completed.emit(chat(self.messages))
        except Exception as exc: self.failed.emit(str(exc))

class Reactor(QWidget):
    def __init__(self,parent=None):
        super().__init__(parent); self.setMinimumSize(220,220); self.phase=0
        self.timer=QTimer(self); self.timer.timeout.connect(self.animate); self.timer.start(45)
    def animate(self): self.phase=(self.phase+1)%360; self.update()
    def paintEvent(self,event):
        p=QPainter(self); p.setRenderHint(QPainter.RenderHint.Antialiasing)
        side=min(self.width(),self.height())*.78; cx=self.width()/2; cy=self.height()/2; r=side/2
        glow=QRadialGradient(cx,cy,r*1.2); glow.setColorAt(0,QColor(27,177,209,55)); glow.setColorAt(1,QColor(8,13,22,0))
        p.setPen(Qt.PenStyle.NoPen); p.setBrush(glow); p.drawEllipse(QRectF(cx-r*1.2,cy-r*1.2,r*2.4,r*2.4))
        for i,rad in enumerate((r*.88,r*.68,r*.48)):
            p.setPen(QPen(QColor(82,230,242,125-i*22),1.4)); p.setBrush(Qt.BrushStyle.NoBrush); p.save(); p.translate(cx,cy); p.rotate(self.phase*(1 if i%2==0 else -.7)+i*35); p.drawEllipse(QRectF(-rad,-rad*.76,rad*2,rad*1.52)); p.restore()
        core=QRadialGradient(cx-r*.08,cy-r*.1,r*.52); core.setColorAt(0,QColor("#e6ffff")); core.setColorAt(.25,QColor("#72f4ff")); core.setColorAt(.6,QColor("#178ba9")); core.setColorAt(1,QColor(8,35,62,40))
        p.setPen(QPen(QColor(123,246,255,170),1)); p.setBrush(core); p.drawEllipse(QRectF(cx-r*.38,cy-r*.38,r*.76,r*.76)); p.end()

def label(text,size=10,color=TEXT,weight=QFont.Weight.Normal):
    w=QLabel(text); w.setFont(QFont("Inter",size,weight)); w.setStyleSheet(f"color:{color};background:transparent;"); return w
def card():
    w=QFrame(); w.setObjectName("card"); return w

class AirisWindow(QMainWindow):
    def __init__(self):
        super().__init__(); self.setWindowTitle("Nova Airis"); self.resize(1280,820); self.setMinimumSize(980,680)
        self.history=[]; self.worker=None
        self.setStyleSheet(f"""QMainWindow,QWidget{{background:{BG};color:{TEXT}}}
        QFrame#sidebar{{background:#0a111c;border-right:1px solid {LINE}}}
        QFrame#card{{background:{PANEL};border:1px solid {LINE};border-radius:18px}}
        QPushButton{{background:{PANEL2};color:{TEXT};border:1px solid {LINE};border-radius:10px;padding:10px 14px}}
        QPushButton:hover{{border-color:{CYAN};background:#142637}}
        QPushButton#primary{{background:#123b4b;border:1px solid #287b8a;color:#d9fcff}}
        QPushButton:disabled{{color:#5c6c7d;background:#101923}}
        QLineEdit{{background:#0b1420;color:{TEXT};border:1px solid #284158;border-radius:13px;padding:15px;selection-background-color:#176d80}}
        QScrollArea{{border:none;background:transparent}}""")
        root=QWidget(); outer=QHBoxLayout(root); outer.setContentsMargins(0,0,0,0); outer.setSpacing(0); self.setCentralWidget(root)
        side=QFrame(); side.setObjectName("sidebar"); side.setFixedWidth(220); sl=QVBoxLayout(side); sl.setContentsMargins(18,22,18,18); sl.setSpacing(10)
        brand=QHBoxLayout(); mark=QLabel("✦"); mark.setStyleSheet(f"color:{CYAN};font-size:28px;background:transparent"); brand.addWidget(mark); brand.addWidget(label("NOVA AIRIS",13,TEXT,QFont.Weight.Bold)); brand.addStretch(); sl.addLayout(brand); sl.addSpacing(28)
        sl.addWidget(label("ESPAÇO DE TRABALHO",8,MUTED,QFont.Weight.Bold))
        for name in ["◈   Conversa","◎   Teia Cognitiva","⌁   Projetos","▤   Memórias"]:
            b=QPushButton(name); b.setStyleSheet("text-align:left;padding:12px;border:0;background:transparent")
            if name.startswith("◈"): b.setStyleSheet(f"text-align:left;padding:12px;background:#102b3a;border:1px solid #1e5364;border-radius:10px;color:{CYAN}")
            sl.addWidget(b)
        sl.addStretch(); status=card(); st=QVBoxLayout(status); st.addWidget(label("SISTEMA",8,MUTED,QFont.Weight.Bold)); st.addWidget(label("●  Interface local ativa",10,CYAN)); st.addWidget(label("IA via OpenRouter",9,MUTED)); sl.addWidget(status); outer.addWidget(side)
        main=QWidget(); ml=QVBoxLayout(main); ml.setContentsMargins(30,22,30,24); ml.setSpacing(18)
        top=QHBoxLayout(); top.addWidget(label("CENTRO DE COMANDO  /  VISÃO GERAL",9,MUTED,QFont.Weight.Bold)); top.addStretch(); self.clock=label("",10,MUTED); top.addWidget(self.clock); ml.addLayout(top)
        hero=QHBoxLayout(); hero.setSpacing(18); intro=card(); il=QVBoxLayout(intro); il.setContentsMargins(24,24,24,24)
        il.addWidget(label("SUA INTELIGÊNCIA, CONECTADA",9,CYAN,QFont.Weight.Bold)); il.addWidget(label("Olá. Eu sou a Nova Airis.",25,TEXT,QFont.Weight.Bold))
        desc=label("Um espaço para pensar, criar e conectar ideias. A Teia Cognitiva será o mapa vivo do seu conhecimento.",11,MUTED); desc.setWordWrap(True); il.addWidget(desc); il.addSpacing(12); il.addWidget(label("NÚCLEO DO SISTEMA",8,MUTED,QFont.Weight.Bold)); self.state=label("●  Pronta para conversar",10,CYAN); il.addWidget(self.state); il.addStretch(); il.addWidget(label("PYTHON  •  PYSIDE6  •  OPENROUTER",8,"#5d738a")); hero.addWidget(intro,3)
        core=card(); cl=QVBoxLayout(core); cl.setContentsMargins(10,6,10,10); cl.addWidget(Reactor(),1); cl.addWidget(label("AIRIS CORE  /  STANDBY",8,CYAN,QFont.Weight.Bold),alignment=Qt.AlignmentFlag.AlignCenter); hero.addWidget(core,2); ml.addLayout(hero,3)
        lower=QHBoxLayout(); lower.setSpacing(18); chatbox=card(); chatl=QVBoxLayout(chatbox); chatl.setContentsMargins(20,18,20,18); head=QHBoxLayout(); head.addWidget(label("CONVERSA",10,TEXT,QFont.Weight.Bold)); head.addStretch(); head.addWidget(label("SESSÃO LOCAL",8,MUTED)); chatl.addLayout(head)
        self.scroll=QScrollArea(); self.scroll.setWidgetResizable(True); self.messages=QWidget(); self.message_layout=QVBoxLayout(self.messages); self.message_layout.setAlignment(Qt.AlignmentFlag.AlignTop); self.message_layout.setSpacing(10)
        welcome=label("Olá! Configure OPENROUTER_API_KEY no terminal para conversar com um modelo. Suas mensagens ficam na memória desta sessão.",10,MUTED); welcome.setWordWrap(True); self.message_layout.addWidget(welcome); self.scroll.setWidget(self.messages); chatl.addWidget(self.scroll,1)
        row=QHBoxLayout(); self.entry=QLineEdit(); self.entry.setPlaceholderText("Escreva uma ideia ou pergunta…"); self.entry.returnPressed.connect(self.send_message); self.send=QPushButton("Enviar  ↗"); self.send.setObjectName("primary"); self.send.clicked.connect(self.send_message); row.addWidget(self.entry,1); row.addWidget(self.send); chatl.addLayout(row); lower.addWidget(chatbox,3)
        right=QVBoxLayout(); memory=card(); meml=QVBoxLayout(memory); meml.setContentsMargins(18,18,18,18); meml.addWidget(label("TEIA COGNITIVA",10,TEXT,QFont.Weight.Bold)); meml.addWidget(label("Sua rede de conhecimento começa aqui.",9,MUTED))
        for k,v in [("Nós conectados","0"),("Projetos ativos","0"),("Memórias locais","0")]:
            r=QHBoxLayout(); r.addWidget(label(k,9,MUTED)); r.addStretch(); r.addWidget(label(v,11,CYAN,QFont.Weight.Bold)); meml.addLayout(r)
        right.addWidget(memory,1); modules=card(); modl=QVBoxLayout(modules); modl.setContentsMargins(18,18,18,18); modl.addWidget(label("MÓDULOS",10,TEXT,QFont.Weight.Bold)); modl.addWidget(label("Voz local",10,MUTED)); modl.addWidget(label("○  Ainda não configurada",9,"#d5b779")); modl.addWidget(label("Provedor de IA",10,MUTED)); modl.addWidget(label("●  OpenRouter (opcional)",9,CYAN)); modl.addStretch(); modl.addWidget(label("A chave é lida do ambiente, nunca da tela.",8,MUTED)); right.addWidget(modules,1); lower.addLayout(right,2); ml.addLayout(lower,4); outer.addWidget(main,1)
        self.tick=QTimer(self); self.tick.timeout.connect(self.update_clock); self.tick.start(1000); self.update_clock()
    def update_clock(self): self.clock.setText(datetime.now().astimezone().strftime("%d/%m/%Y  •  %H:%M:%S"))
    def add_message(self,prefix,text,color):
        item=label(prefix+"  ·  "+text,10,color); item.setWordWrap(True); item.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse); self.message_layout.addWidget(item); QTimer.singleShot(40,lambda:self.scroll.verticalScrollBar().setValue(self.scroll.verticalScrollBar().maximum())); return item
    def send_message(self):
        text=self.entry.text().strip()
        if not text or (self.worker and self.worker.isRunning()): return
        self.entry.clear(); self.add_message("VOCÊ",text,TEXT); self.history.append({"role":"user","content":text}); self.state.setText("●  Consultando o modelo…"); self.send.setEnabled(False); self.entry.setEnabled(False)
        self.pending=self.add_message("AIRIS","Pensando…",CYAN)
        self.worker=ChatWorker(self.history[-20:]); self.worker.completed.connect(self.on_answer); self.worker.failed.connect(self.on_error); self.worker.finished.connect(self.on_finished); self.worker.start()
    def on_answer(self,text):
        self.pending.setText("AIRIS  ·  "+text); self.history.append({"role":"assistant","content":text}); self.state.setText("●  Resposta recebida")
    def on_error(self,error):
        self.pending.setText("AIRIS  ·  "+error); self.state.setText("●  Verifique a conexão/configuração")
    def on_finished(self):
        self.send.setEnabled(True); self.entry.setEnabled(True); self.entry.setFocus()
def main():
    app=QApplication(sys.argv); app.setApplicationName("Nova Airis"); window=AirisWindow(); window.show(); sys.exit(app.exec())
if __name__=="__main__": main()
