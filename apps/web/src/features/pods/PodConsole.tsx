import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { io, Socket } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';
import { getApiBaseUrl } from '../../api/http';
import { getClusterContext } from '../../api/cluster-context';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import type { PodSummary } from '@dpd/shared';

interface PodConsoleProps {
  namespace: string;
  deploymentName: string;
  pods: PodSummary[];
  selectedPod: string;
  onPodChange: (podName: string) => void;
}

export function PodConsole({ namespace, deploymentName, pods, selectedPod, onPodChange }: PodConsoleProps) {
  const { t } = useTranslation('deployments');
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const dataDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const activePod = selectedPod || pods[0]?.name || '';
  const activeContainer = pods.find((pod) => pod.name === activePod)?.containers[0]?.name;

  useEffect(() => {
    const container = terminalContainerRef.current;
    if (!container) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      fontSize: 13,
      lineHeight: 1.35,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      scrollback: 5000,
      theme: {
        background: '#111827',
        foreground: '#e5e7eb',
        cursor: '#e5e7eb',
        selectionBackground: '#374151',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(container);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;
    setTerminalReady(true);

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      setTerminalReady(false);
    };
  }, []);

  const cleanupDataListener = useCallback(() => {
    dataDisposableRef.current?.dispose();
    dataDisposableRef.current = null;
  }, []);

  const disconnectSession = useCallback(
    (showMessage = false) => {
      socketRef.current?.emit('stop');
      socketRef.current?.disconnect();
      socketRef.current = null;
      cleanupDataListener();
      setConnected(false);
      setIsConnecting(false);
      if (showMessage) {
        terminalRef.current?.writeln(`\r\n\x1b[33m${t('console.disconnected')}\x1b[0m`);
      }
    },
    [cleanupDataListener, t],
  );

  const connect = useCallback(() => {
    const terminal = terminalRef.current;
    if (!activePod || !terminal) {
      return;
    }

    disconnectSession();

    terminal.reset();
    terminal.clear();
    setIsConnecting(true);
    setConnected(false);

    const socket = io('/exec', {
      path: `${getApiBaseUrl()}/ws`,
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;

    const onTerminalData = terminal.onData((data) => {
      socket.emit('stdin', { data });
    });
    dataDisposableRef.current = onTerminalData;

    socket.on('connect', () => {
      socket.emit('start', {
        namespace,
        deployment: deploymentName,
        pod: activePod,
        container: activeContainer,
        cluster: getClusterContext(),
      });
    });

    socket.on('started', () => {
      setConnected(true);
      setIsConnecting(false);
      fitAddonRef.current?.fit();
      terminal.focus();
    });

    socket.on('stdout', (payload: { data: string }) => terminal.write(payload.data));
    socket.on('stderr', (payload: { data: string }) => terminal.write(payload.data));
    socket.on('error', (payload: { message: string }) => {
      setIsConnecting(false);
      setConnected(false);
      terminal.writeln(`\r\n\x1b[31m[error]\x1b[0m ${payload.message}`);
    });
    socket.on('exit', () => {
      setConnected(false);
      setIsConnecting(false);
      terminal.writeln(`\r\n\x1b[33m${t('console.disconnected')}\x1b[0m`);
      cleanupDataListener();
    });
  }, [activeContainer, activePod, cleanupDataListener, deploymentName, disconnectSession, namespace, t]);

  useEffect(() => {
    if (!terminalReady || !activePod) {
      return;
    }

    connect();

    return () => {
      disconnectSession();
    };
  }, [activePod, activeContainer, connect, disconnectSession, namespace, terminalReady]);

  if (!pods.length) {
    return <Card className="p-6 text-sm text-secondary">{t('detail.logsEmpty')}</Card>;
  }

  const statusLabel = isConnecting
    ? t('console.connecting')
    : connected
      ? t('console.statusConnected')
      : t('console.statusDisconnected');

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {pods.length > 1 && (
            <Select
              value={activePod}
              onChange={(event) => onPodChange(event.target.value)}
              className="min-w-[12rem]"
            >
              {pods.map((pod) => (
                <option key={pod.name} value={pod.name}>
                  {pod.name}
                </option>
              ))}
            </Select>
          )}
          <span className="text-xs text-secondary">{statusLabel}</span>
        </div>
        {connected && (
          <button
            type="button"
            onClick={() => disconnectSession(true)}
            className="rounded-apple border border-border px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
          >
            {t('console.disconnect')}
          </button>
        )}
      </div>

      <div
        ref={terminalContainerRef}
        className="h-[32rem] min-h-[32rem] overflow-hidden bg-[#111827] px-3 py-3"
        onClick={() => terminalRef.current?.focus()}
      />
    </Card>
  );
}
