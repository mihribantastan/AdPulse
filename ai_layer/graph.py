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

# NOT: "media" düğümünden önce durdurma KALDIRILDI. Insan onayı zaten LangGraph'in
# interrupt/resume mekanizmasıyla değil, ayrı bir yol üzerinden yapılıyor: Laravel
# kampanyayı "pending" kaydediyor, kullanıcı Kampanya Detayı'ndan onaylayınca ayrı bir
# Redis kuyruğu (adpulse_publish_queue) üzerinden publisher.py/meta_publisher.py
# doğrudan çağrılıyor - queue_worker.py hiçbir zaman app.invoke(None, config) ile
# grafı devam ettirmiyordu, yani media_agent hiç çalışmıyordu. Hedefleme (yaş aralığı,
# bütçe dağılımı) reklam onayından ÖNCE karar verilebilecek bir şey olduğu için
# media_agent'ı research/creative ile aynı ilk çalıştırmada (insan onayından önce)
# çalıştırmak daha doğru - üretilen targeting/budget artık kampanyanın
# ai_analysis_results'ına kaydedilip onay anında publisher'lara geçiyor.
app = workflow.compile(checkpointer=memory)

if __name__ == "__main__":
    initial_state = {
        "campaign_id": 1,
        "target_product": "Oyuncu Mouse",
        "daily_budget": 15000.50,
        "status": "pending"
    }

    # Hafızanın hangi oturumu (thread) takip edeceğini belirtmemiz şart
    config = {"configurable": {"thread_id": "kampanya_1"}}

    print("🚀 Graf çalıştırılıyor (research → creative → media)...\n" + "-"*40)
    final_state = app.invoke(initial_state, config)

    print("\n🎉 FİNAL ÇIKTISI:")
    import pprint
    pprint.pprint(final_state)