import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileCode,
  Play,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { parseMermaidClassDiagram } from '../../services/mermaidParser';
import { SAMPLE_DIAGRAMS } from '../../utils/sampleDiagrams';
import './MermaidEditor.css';

interface MermaidEditorProps {
  isOpen: boolean;
  currentCode: string;
  onClose: () => void;
  onApplyCode: (code: string) => void;
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({
  isOpen,
  currentCode,
  onClose,
  onApplyCode,
}) => {
  const [editorText, setEditorText] = useState(currentCode);
  const [copied, setCopied] = useState(false);

  // Sync editor text if currentCode changes when modal opens
  React.useEffect(() => {
    setEditorText(currentCode);
  }, [currentCode, isOpen]);

  if (!isOpen) return null;

  // Real-time validation test
  const validationResult = parseMermaidClassDiagram(editorText);

  // Handle file upload (.mmd, .txt, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setEditorText(content);
      }
    };
    reader.readAsText(file);
  };

  // Copy code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(editorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!validationResult.success) return;
    onApplyCode(editorText);
    onClose();
  };

  return (
    <div className="mermaid-editor-overlay animate-fade-in" id="mermaid-editor-modal">
      <div className="mermaid-editor-modal glass-panel">
        {/* Modal Header */}
        <div className="editor-modal-header">
          <div className="header-title-box">
            <FileCode size={20} className="editor-title-icon" />
            <div>
              <h2 className="editor-modal-title">Editor e Importação Mermaid</h2>
              <p className="editor-modal-sub">
                Insira ou importe diagramas de classe em formato Mermaid (.mmd)
              </p>
            </div>
          </div>
          <button className="editor-close-btn" onClick={onClose} aria-label="Fechar editor">
            <X size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <label className="btn btn-secondary file-upload-label" title="Importar arquivo .mmd ou .txt">
              <Upload size={14} />
              <span>Importar Arquivo (.mmd)</span>
              <input
                type="file"
                accept=".mmd,.txt,.mermaid"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            {/* Quick Sample Selector */}
            <select
              className="editor-sample-select"
              onChange={(e) => {
                const sample = SAMPLE_DIAGRAMS.find((s) => s.id === e.target.value);
                if (sample) setEditorText(sample.code);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Carregar Modelo de Exemplo...
              </option>
              {SAMPLE_DIAGRAMS.map((sample) => (
                <option key={sample.id} value={sample.id}>
                  {sample.name} ({sample.classCount} classes)
                </option>
              ))}
            </select>
          </div>

          <div className="toolbar-right">
            <button
              className="btn btn-ghost"
              onClick={() => setEditorText(SAMPLE_DIAGRAMS[0].code)}
              title="Restaurar modelo padrão"
            >
              <RotateCcw size={14} />
              <span>Restaurar Padrão</span>
            </button>

            <button className="btn btn-ghost" onClick={handleCopy} title="Copiar código">
              <Copy size={14} />
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Validation Banner */}
        <div className="validation-bar">
          {validationResult.success ? (
            <div className="validation-status success">
              <CheckCircle2 size={16} />
              <span>
                Mermaid válido: {Object.keys(validationResult.diagram!.classes).length} classes e{' '}
                {validationResult.diagram!.relations.length} relacionamentos detectados.
              </span>
            </div>
          ) : (
            <div className="validation-status error">
              <AlertCircle size={16} />
              <span>{validationResult.error}</span>
            </div>
          )}
        </div>

        {/* Code Editor Area */}
        <div className="editor-textarea-wrapper">
          <textarea
            className="mermaid-code-textarea"
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
            placeholder="Cole seu diagrama aqui começando com classDiagram..."
            spellCheck={false}
            id="mermaid-textarea"
          />
        </div>

        {/* UML Syntax Quick Reference */}
        <div className="quick-reference-footer">
          <span className="ref-title">Sintaxe rápida:</span>
          <code>&lt;|--</code> Herança
          <code>*--</code> Composição
          <code>o--</code> Agregação
          <code>--&gt;</code> Associação
          <code>..&gt;</code> Dependência
          <code>&lt;|..</code> Realização
          <code>"1" --&gt; "*"</code> Cardinalidade
        </div>

        {/* Footer Actions */}
        <div className="editor-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleApply}
            disabled={!validationResult.success}
            id="btn-apply-diagram"
          >
            <Play size={15} />
            <span>Visualizar no Grafo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
