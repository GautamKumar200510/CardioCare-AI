import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AgentChat from '../components/AgentChat';
import AgentTimeline from '../components/AgentTimeline';

const Agent = () => {
  const [agentState, setAgentState] = useState({
    workflowState: 'IDLE',
    toolExecutionHistory: [],
    retryCount: 0,
    extractedIntent: {},
  });

  const handleStateUpdate = (update) => {
    setAgentState((prev) => ({
      ...prev,
      workflowState: update.workflowState || prev.workflowState,
      toolExecutionHistory: update.conversation?.toolExecutionHistory || prev.toolExecutionHistory,
      retryCount: update.conversation?.retryCount ?? prev.retryCount,
      extractedIntent: update.conversation?.extractedIntent || prev.extractedIntent,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full min-h-0">
            {/* Left Column: Conversational AI Agent Panel */}
            <div className="lg:col-span-7 h-full flex flex-col min-h-0">
              <AgentChat onStateUpdate={handleStateUpdate} />
            </div>

            {/* Right Column: Dedicated Agent Activity Inspector / Timeline */}
            <div className="lg:col-span-5 h-full flex flex-col min-h-0">
              <AgentTimeline
                workflowState={agentState.workflowState}
                toolExecutionHistory={agentState.toolExecutionHistory}
                retryCount={agentState.retryCount}
                extractedIntent={agentState.extractedIntent}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Agent;
