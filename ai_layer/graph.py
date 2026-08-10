from dotenv import load_dotenv
load_dotenv()

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver # HAFIZA MODÜLÜ EKLENDİ
from state import CampaignState
from agents import research_agent, creative_agent, media_agent

workflow = StateGraph(CampaignState)

workflow.add_node("research", research_agent)
workflow.add_node("creative", creative_agent)
workflow.add_node("media", media_agent)

workflow.add_edge(START, "research")
workflow.add_edge("research", "creative")
workflow.add_edge("creative", "media")
workflow.add_edge("media", END)

# 1. Hafıza nesnesini oluştur
memory = MemorySaver()

# 2. Grafı derlerken hafızayı bağla ve "media" düğümünden ÖNCE durdur!
app = workflow.compile(
    checkpointer=memory,
    interrupt_before=["media"]
)

if __name__ == "__main__":
    initial_state = {
        "campaign_id": 1,
        "target_product": "Oyuncu Mouse",
        "daily_budget": 15000.50,
        "status": "pending"
    }

    # Hafızanın hangi oturumu (thread) takip edeceğini belirtmemiz şart
    config = {"configurable": {"thread_id": "kampanya_1"}}

    print("🚀 1. AŞAMA: Graf Başlatılıyor (Onaya Kadar Çalışacak)...\n" + "-"*40)
    
    # Grafı çalıştır
    state_after_creative = app.invoke(initial_state, config)
    
    print("⏸️ GRAF DURAKLATILDI! İnsan Onayı Bekleniyor...\n")
    print("Şu anki State:")
    import pprint
    pprint.pprint(state_after_creative)
    
    print("\n" + "-"*40 + "\n✅ 2. AŞAMA: İnsan Onayı Verildi! Kalan Kısım Çalıştırılıyor...")
    
    # Hiçbir yeni veri vermeden (None) sadece aynı config ile invoke edersek, kaldığı yerden devam eder!
    final_state = app.invoke(None, config)
    
    print("\n🎉 FİNAL ÇIKTISI:")
    pprint.pprint(final_state)