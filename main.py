"""Nova Airis — desktop UI prototype in Python/PySide6."""
import sys
from datetime import datetime
from PySide6.QtCore import Qt, QTimer, QRectF
from PySide6.QtGui import QColor, QFont, QPainter, QPen, QRadialGradient
from PySide6.QtWidgets import (
    QApplication, QFrame, QHBoxLayout, QLabel, QLineEdit, QMainWindow,
    QPushButton, QScrollArea, QSizePolicy, QVBoxLayout, QWidget
)

BG = "#080d16"
PANEL = "#0e1724"
PANEL_2 = "#111e2d"
LINE = "#203449"
TEXT = "#e8f2ff"
MUTED = "#8195ab"
CYAN = "#52e6f2"
BLUE = "#6695ff"


class Reactor(QWidget):
    """Lightweight animated core drawn with QPainter (no external assets)."""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumSize(240, 240)
        self.phase = 0
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.animate)
        self.timer.start(40)

    def animate(self):
        self.phase = (self.phase + 1) % 360
        self.update()

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        side = min(self.width(), self.height()) * .78
        cx, cy = self.width()/2, self.height()/2
        r = side/2
        glow = QRadialGradient(cx, cy, r*1.2)
        glow.setColorAt(0, QColor(27, 177, 209, 48))
        glow.setColorAt(.65, QColor(30, 111, 177, 20))
        glow.setColorAt(1, QColor(8, 13, 22, 0))
        p.setPen(Qt.PenStyle.NoPen)
        p.setBrush(glow)
        p.drawEllipse(QRectF(cx-r*1.2, cy-r*1.2, r*2.4, r*2.4))
        for i, radius in enumerate((r*.88, r*.68, r*.48)):
            pen = QPen(QColor(82, 230, 242, 120 - i*20), 1.3)
            p.setPen(pen)
            p.setBrush(Qt.BrushStyle.NoBrush)
            p.save()
            p.translate(cx, cy)
            p.rotate(self.phase * (1 if i % 2 == 0 else -0.7) + i*35)
            p.drawEllipse(QRectF(-radius, -radius*.76, radius*2, radius*1.52))
            p.restore()
        core = QRadialGradient(cx-r*.08, cy-r*.1, r*.52)
        core.setColorAt(0, QColor("#e6ffff"))
        core.setColorAt(.22, QColor("#72f4ff"))
        core.setColorAt(.55, QColor("#178ba9"))
        core.setColorAt(1, QColor(8, 35, 62, 40))
        p.setPen(QPen(QColor(123, 246, 255, 170), 1))
        p.setBrush(core)
        p.drawEllipse(QRectF(cx-r*.38, cy-r*.38, r*.76, r*.76))
        p.end()


def label(text, size=10, color=TEXT, weight=QFont.Weight.Normal):
    w = QLabel(text)
    w.setFont(QFont("Inter", size, weight))
    w.setStyleSheet(f"color:{color}; background:transparent;")
    return w


def card():
    w = QFrame()
    w.setObjectName("card")
    w.setFrameShape(QFrame.Shape.NoFrame)
    return w


class AirisWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Nova Airis")
        self.resize(1280, 820)
        self.setMinimumSize(980, 680)
        self.setStyleSheet(f"""
            QMainWindow, QWidget {{ background:{BG}; color:{TEXT}; }}
            QFrame#sidebar {{ background:#0a111c; border-right:1px solid {LINE}; }}
            QFrame#card {{ background:{PANEL}; border:1px solid {LINE}; border-radius:18px; }}
            QLabel#eyebrow {{ color:{CYAN}; letter-spacing:2px; }}
            QPushButton {{ background:{PANEL_2}; color:{TEXT}; border:1px solid {LINE};
                           border-radius:10px; padding:10px 14px; }}
            QPushButton:hover {{ border-color:{CYAN}; background:#142637; }}
            QPushButton#primary {{ background:#123b4b; border:1px solid #287b8a; color:#d9fcff; }}
            QLineEdit {{ background:#0b1420; color:{TEXT}; border:1px solid #284158;
                         border-radius:13px; padding:15px; selection-background-color:#176d80; }}
            QScrollArea {{ border:none; background:transparent; }}
        """)
        root = QWidget()
        outer = QHBoxLayout(root)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)
        self.setCentralWidget(root)

        sidebar = QFrame()
        sidebar.setObjectName("sidebar")
        sidebar.setFixedWidth(220)
        sl = QVBoxLayout(sidebar)
        sl.setContentsMargins(18, 22, 18, 18)
        sl.setSpacing(10)
        brand = QHBoxLayout()
        mark = QLabel("✦")
        mark.setStyleSheet(f"color:{CYAN};font-size:28px;background:transparent;")
        brand.addWidget(mark)
        brand.addWidget(label("NOVA AIRIS", 13, TEXT, QFont.Weight.Bold))
        brand.addStretch()
        sl.addLayout(brand)
        sl.addSpacing(28)
        sl.addWidget(label("ESPAÇO DE TRABALHO", 8, MUTED, QFont.Weight.Bold))
        for name in ["◈   Conversa", "◎   Teia Cognitiva", "⌁   Projetos", "▤   Memórias"]:
            b = QPushButton(name)
            b.setStyleSheet("text-align:left;padding:12px;border:0;background:transparent;")
            sl.addWidget(b)
            if name.startswith("◈"):
                b.setStyleSheet(f"text-align:left;padding:12px;background:#102b3a;border:1px solid #1e5364;border-radius:10px;color:{CYAN};")
        sl.addStretch()
        status = card()
        st = QVBoxLayout(status)
        st.addWidget(label("SISTEMA", 8, MUTED, QFont.Weight.Bold))
        st.addWidget(label("●  Interface local ativa", 10, CYAN))
        st.addWidget(label("IA: não conectada", 9, MUTED))
        sl.addWidget(status)
        outer.addWidget(sidebar)

        main = QWidget()
        ml = QVBoxLayout(main)
        ml.setContentsMargins(30, 22, 30, 24)
        ml.setSpacing(18)
        top = QHBoxLayout()
        top.addWidget(label("CENTRO DE COMANDO  /  VISÃO GERAL", 9, MUTED, QFont.Weight.Bold))
        top.addStretch()
        self.clock = label("", 10, MUTED)
        top.addWidget(self.clock)
        ml.addLayout(top)

        hero = QHBoxLayout()
        hero.setSpacing(18)
        left = card()
        ll = QVBoxLayout(left)
        ll.setContentsMargins(24, 24, 24, 24)
        ll.addWidget(label("SUA INTELIGÊNCIA, CONECTADA", 9, CYAN, QFont.Weight.Bold))
        title = label("Olá. Eu sou a Airis.", 25, TEXT, QFont.Weight.Bold)
        ll.addWidget(title)
        desc = label("Um espaço para pensar, criar e conectar ideias.\nA Teia Cognitiva será o mapa vivo do seu conhecimento.", 11, MUTED)
        desc.setWordWrap(True)
        ll.addWidget(desc)
        ll.addSpacing(12)
        ll.addWidget(label("NÚCLEO DO SISTEMA", 8, MUTED, QFont.Weight.Bold))
        self.state = label("●  Aguardando sua primeira mensagem", 10, CYAN)
        ll.addWidget(self.state)
        ll.addStretch()
        ll.addWidget(label("PROTÓTIPO DE INTERFACE • PYTHON + PYSIDE6", 8, "#5d738a"))
        hero.addWidget(left, 3)

        core = card()
        cl = QVBoxLayout(core)
        cl.setContentsMargins(10, 6, 10, 10)
        self.reactor = Reactor()
        cl.addWidget(self.reactor, 1)
        cl.addWidget(label("AIRIS CORE  /  STANDBY", 8, CYAN, QFont.Weight.Bold), alignment=Qt.AlignmentFlag.AlignCenter)
        hero.addWidget(core, 2)
        ml.addLayout(hero, 3)

        lower = QHBoxLayout()
        lower.setSpacing(18)
        chat = card()
        chat_layout = QVBoxLayout(chat)
        chat_layout.setContentsMargins(20, 18, 20, 18)
        head = QHBoxLayout()
        head.addWidget(label("CONVERSA", 10, TEXT, QFont.Weight.Bold))
        head.addStretch()
        head.addWidget(label("SESSÃO LOCAL", 8, MUTED))
        chat_layout.addLayout(head)
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.messages = QWidget()
        self.message_layout = QVBoxLayout(self.messages)
        self.message_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.message_layout.setSpacing(10)
        welcome = label("Ainda estou em modo de demonstração. A interface está pronta para receber o módulo de IA.", 10, MUTED)
        welcome.setWordWrap(True)
        self.message_layout.addWidget(welcome)
        self.scroll.setWidget(self.messages)
        chat_layout.addWidget(self.scroll, 1)
        input_row = QHBoxLayout()
        self.entry = QLineEdit()
        self.entry.setPlaceholderText("Escreva uma ideia ou uma pergunta…")
        self.entry.returnPressed.connect(self.send_message)
        send = QPushButton("Enviar  ↗")
        send.setObjectName("primary")
        send.clicked.connect(self.send_message)
        input_row.addWidget(self.entry, 1)
        input_row.addWidget(send)
        chat_layout.addLayout(input_row)
        lower.addWidget(chat, 3)

        right = QVBoxLayout()
        memory = card()
        meml = QVBoxLayout(memory)
        meml.setContentsMargins(18, 18, 18, 18)
        meml.addWidget(label("TEIA COGNITIVA", 10, TEXT, QFont.Weight.Bold))
        meml.addWidget(label("Sua rede de conhecimento começa aqui.", 9, MUTED))
        meml.addSpacing(8)
        for k, v in [("Nós conectados", "0"), ("Projetos ativos", "0"), ("Memórias locais", "0")]:
            row = QHBoxLayout()
            row.addWidget(label(k, 9, MUTED))
            row.addStretch()
            row.addWidget(label(v, 11, CYAN, QFont.Weight.Bold))
            meml.addLayout(row)
        right.addWidget(memory, 1)
        models = card()
        modl = QVBoxLayout(models)
        modl.setContentsMargins(18, 18, 18, 18)
        modl.addWidget(label("MÓDULOS", 10, TEXT, QFont.Weight.Bold))
        modl.addWidget(label("Voz local", 10, MUTED))
        modl.addWidget(label("○  Não configurada", 9, "#d5b779"))
        modl.addWidget(label("Provedor de IA", 10, MUTED))
        modl.addWidget(label("○  Aguardando configuração", 9, "#d5b779"))
        modl.addStretch()
        modl.addWidget(label("Nenhuma chave de API é solicitada nesta tela.", 8, MUTED))
        right.addWidget(models, 1)
        lower.addLayout(right, 2)
        ml.addLayout(lower, 4)
        outer.addWidget(main, 1)

        self.tick = QTimer(self)
        self.tick.timeout.connect(self.update_clock)
        self.tick.start(1000)
        self.update_clock()

    def update_clock(self):
        self.clock.setText(datetime.now().astimezone().strftime("%d/%m/%Y  •  %H:%M:%S"))

    def send_message(self):
        text = self.entry.text().strip()
        if not text:
            return
        user = label("VOCÊ  ·  " + text, 10, TEXT, QFont.Weight.DemiBold)
        user.setWordWrap(True)
        self.message_layout.addWidget(user)
        answer = label("AIRIS  ·  Recebi sua mensagem. Este protótipo visual ainda não está conectado a um modelo de IA.", 10, CYAN)
        answer.setWordWrap(True)
        self.message_layout.addWidget(answer)
        self.entry.clear()
        self.state.setText("●  Mensagem recebida • modo demonstração")
        QTimer.singleShot(50, lambda: self.scroll.verticalScrollBar().setValue(self.scroll.verticalScrollBar().maximum()))


def main():
    app = QApplication(sys.argv)
    app.setApplicationName("Nova Airis")
    window = AirisWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
