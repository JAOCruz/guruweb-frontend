import { useEffect, useState, useMemo } from 'react';
import { botAPI, DocumentIndexItem, DocGenTemplateVariable } from '../services/botApi';
import { Search, ChevronDown, ChevronRight, FileText, Folder, Tag, MessageCircle, Loader, List, Network, Grid3x3, Scale, ExternalLink, Eye, X, Maximize2, Wand2, Download, Users } from 'lucide-react';
import { LAWS } from '../data/laws';
import { NeoCard, NeoButton, NeoInput, NeoSelect, NeoBadge } from '@guru/ui';
import { fetchAuthenticatedFile } from '../utils';

type ViewMode = 'folder' | 'tree' | 'outline';

interface FolderNode {
  name: string;
  path: string;
  isFolder: boolean;
  documents?: DocumentIndexItem[];
  children?: FolderNode[];
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<DocumentIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<DocumentIndexItem | null>(null);
  const [comment, setComment] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('folder');
  const [showPreview, setShowPreview] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMaximized, setPreviewMaximized] = useState(false);

  // Document generator modal state
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorTemplate, setGeneratorTemplate] = useState<DocumentIndexItem | null>(null);
  const [generatorClients, setGeneratorClients] = useState<Array<{ id: number | string; name?: string; phone: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [templateVariables, setTemplateVariables] = useState<DocGenTemplateVariable[]>([]);
  const [templateRoles, setTemplateRoles] = useState<Record<string, string[]>>({});
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});
  const [assignedRoles, setAssignedRoles] = useState<Record<string, Record<string, string>>>({});
  const [generatorLoading, setGeneratorLoading] = useState(false);
  const [generatorStep, setGeneratorStep] = useState<'client' | 'fields' | 'done' | 'error'>('client');
  const [generatedDownloadUrl, setGeneratedDownloadUrl] = useState<string | null>(null);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  useEffect(() => {
    if (!showPreview || !selectedDoc || selectedDoc.file_extension !== '.pdf') {
      setPreviewBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    let revoked = false;
    setPreviewLoading(true);
    fetchAuthenticatedFile(botAPI.getDocumentFileUrl(selectedDoc.id))
      .then((url) => {
        if (!revoked) setPreviewBlobUrl(url);
      })
      .catch((err) => {
        console.error('Failed to load document preview:', err);
        setPreviewBlobUrl(null);
      })
      .finally(() => setPreviewLoading(false));

    return () => {
      revoked = true;
      setPreviewBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [showPreview, selectedDoc]);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const response = await botAPI.getDocumentIndex();
        setDocuments(response.data.documents);
      } catch (err) {
        setError('Failed to load documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(documents.map(d => d.category))).sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === null || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategory]);

  // Build hierarchical folder structure
  const folderStructure = useMemo(() => {
    const root: Record<string, FolderNode> = {};

    filteredDocuments.forEach(doc => {
      const category = doc.category;
      const subcategory = doc.subcategory;
      const subsubcategory = doc.sub_subcategory;

      if (!root[category]) {
        root[category] = {
          name: category,
          path: category,
          isFolder: true,
          children: [],
          documents: []
        };
      }

      // If no subcategory, add directly to category
      if (!subcategory) {
        root[category].documents!.push(doc);
        return;
      }

      let subNode = root[category].children!.find(c => c.name === subcategory);
      if (!subNode) {
        subNode = {
          name: subcategory,
          path: `${category}/${subcategory}`,
          isFolder: true,
          children: [],
          documents: []
        };
        root[category].children!.push(subNode);
      }

      // If no sub-subcategory, add directly to subcategory
      if (!subsubcategory) {
        subNode.documents!.push(doc);
        return;
      }

      let subsubNode = subNode.children!.find(c => c.name === subsubcategory);
      if (!subsubNode) {
        subsubNode = {
          name: subsubcategory,
          path: `${category}/${subcategory}/${subsubcategory}`,
          isFolder: true,
          children: [],
          documents: []
        };
        subNode.children!.push(subsubNode);
      }

      if (!subsubNode.documents) {
        subsubNode.documents = [];
      }
      subsubNode.documents.push(doc);
    });

    return Object.values(root).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredDocuments]);

  const handleAddComment = async () => {
    if (!selectedDoc || !comment.trim()) return;

    try {
      await botAPI.addDocumentComment(selectedDoc.id, {
        text: comment,
        author: 'System'
      });
      setComment('');
      setSelectedDoc({
        ...selectedDoc,
        comments: [...selectedDoc.comments, { text: comment, created_at: new Date().toISOString() }]
      });
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  // ── Document generator helpers ─────────────────────────────────────────────
  const openGenerator = async (doc: DocumentIndexItem) => {
    setGeneratorTemplate(doc);
    setShowGenerator(true);
    setGeneratorStep('client');
    setSelectedClientId('');
    setCollectedData({});
    setAssignedRoles({});
    setTemplateVariables([]);
    setTemplateRoles({});
    setGeneratedDownloadUrl(null);
    setGeneratorError(null);
    try {
      const { data } = await botAPI.getAllClients();
      setGeneratorClients(data.clients || []);
    } catch (err) {
      console.error('Failed to load clients for generator', err);
    }
  };

  const closeGenerator = () => {
    setShowGenerator(false);
    setGeneratorTemplate(null);
  };

  const loadTemplateFields = async () => {
    if (!generatorTemplate) return;
    setGeneratorLoading(true);
    setGeneratorError(null);
    try {
      const { data } = await botAPI.getDocGenTemplateDetail(generatorTemplate.id);
      setTemplateVariables(data.variables || []);
      setTemplateRoles(data.requiredRoles || {});
      // Prepopulate assignedRoles structure
      const initialRoles: Record<string, Record<string, string>> = {};
      Object.entries(data.requiredRoles || {}).forEach(([role, fields]) => {
        initialRoles[role] = {};
        fields.forEach((field) => { initialRoles[role][field] = ''; });
      });
      setAssignedRoles(initialRoles);
      setCollectedData({});
      setGeneratorStep('fields');
    } catch (err: any) {
      console.error(err);
      setGeneratorError(err?.response?.data?.error || 'Error cargando campos del documento');
    } finally {
      setGeneratorLoading(false);
    }
  };

  const updateRoleField = (role: string, field: string, value: string) => {
    setAssignedRoles((prev) => ({
      ...prev,
      [role]: { ...prev[role], [field]: value },
    }));
  };

  const updateCollectedField = (tag: string, value: string) => {
    setCollectedData((prev) => ({ ...prev, [tag]: value }));
  };

  const handleGenerateDocument = async () => {
    if (!generatorTemplate || !selectedClientId) return;
    setGeneratorLoading(true);
    setGeneratorError(null);
    try {
      const client = generatorClients.find((c) => String(c.id) === selectedClientId);
      const { data: sessionData } = await botAPI.createDocGenSession(
        generatorTemplate.id,
        selectedClientId,
        client?.phone
      );
      const sessionId = String(sessionData.session.id);

      await botAPI.updateDocGenSessionData(sessionId, collectedData, assignedRoles);
      await botAPI.generateDocGenSession(sessionId);

      const downloadUrl = botAPI.getDocGenSessionDownloadUrl(sessionId);
      const blobUrl = await fetchAuthenticatedFile(downloadUrl);
      setGeneratedDownloadUrl(blobUrl);
      setGeneratorStep('done');
    } catch (err: any) {
      console.error(err);
      setGeneratorError(err?.response?.data?.error || err?.message || 'Error generando documento');
      setGeneratorStep('error');
    } finally {
      setGeneratorLoading(false);
    }
  };

  const nonRoleVariables = useMemo(() => {
    const roleTags = new Set<string>();
    Object.entries(templateRoles).forEach(([role, fields]) => {
      fields.forEach((field) => {
        roleTags.add(`${field}_${role}`);
        // Also accept spaced variants
        roleTags.add(`${field} ${role}`);
      });
    });
    return templateVariables.filter((v) => {
      if (v.is_rol_dynamic) return false;
      if (v.rol_type) return false;
      return !roleTags.has(v.tag);
    });
  }, [templateVariables, templateRoles]);

  // Folder View Component
  const FolderTreeNode = ({ node, level = 0 }: { node: FolderNode; level?: number }) => {
    const isExpanded = expandedFolders.has(node.path);
    const hasDocuments = node.documents && node.documents.length > 0;
    const totalItems = (node.children?.length || 0) + (node.documents?.length || 0);

    return (
      <div key={node.path}>
        {node.isFolder && totalItems > 0 && (
          <>
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full flex items-center gap-3 p-3 rounded-base border-2 border-border bg-secondary-background hover:bg-background transition-colors text-left shadow-button"
              style={{ marginLeft: `${level * 16}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-main flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-foreground/60 flex-shrink-0" />
              )}
              <Folder className="w-4 h-4 text-main flex-shrink-0" />
              <span className="font-medium text-base truncate">{node.name}</span>
              {totalItems > 0 && (
                <NeoBadge variant="neutral" className="ml-auto px-3 py-1.5 text-xs">
                  {totalItems}
                </NeoBadge>
              )}
            </button>

            {isExpanded && (
              <>
                {node.children?.map(child => (
                  <FolderTreeNode key={child.path} node={child} level={level + 1} />
                ))}

                {hasDocuments && (
                  <>
                    {node.documents!.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`w-full flex items-center gap-3 p-3 rounded-base border-2 text-left transition-colors ${
                          selectedDoc?.id === doc.id
                            ? 'border-border bg-secondary-background shadow-shadow'
                            : 'border-transparent hover:border-border hover:bg-secondary-background'
                        }`}
                        style={{ marginLeft: `${(level + 1) * 16 + 20}px` }}
                      >
                        <FileText className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                        <p className="text-base font-medium truncate">{doc.name}</p>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // Tree Diagram Component (with ASCII-style lines)
  const TreeDiagramNode = ({ node, level = 0, isLast = true, prefix = '' }: { node: FolderNode; level?: number; isLast?: boolean; prefix?: string }) => {
    const isExpanded = expandedFolders.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const hasDocuments = node.documents && node.documents.length > 0;

    if (!node.isFolder || (!hasChildren && !hasDocuments)) return null;

    const connector = isLast ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');

    return (
      <div key={node.path} className="font-base text-base">
        <button
          onClick={() => toggleFolder(node.path)}
          className="w-full text-left p-3 rounded-base border-2 border-border bg-secondary-background hover:bg-background transition-colors flex items-center gap-3 shadow-button"
        >
          <span className="text-foreground/60 font-mono text-sm">{prefix}{connector}</span>
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-main" />
          ) : (
            <ChevronRight className="w-3 h-3 text-foreground/60" />
          )}
          <Folder className="w-3 h-3 text-main" />
          <span className="text-foreground truncate">{node.name}</span>
          {hasDocuments && <span className="text-base text-foreground/60 ml-auto">({node.documents!.length})</span>}
        </button>

        {isExpanded && (
          <>
            {node.children?.map((child, idx) => (
              <TreeDiagramNode
                key={child.path}
                node={child}
                level={level + 1}
                isLast={idx === node.children!.length - 1}
                prefix={nextPrefix}
              />
            ))}

            {hasDocuments && (
              <div>
                {node.documents!.map((doc, idx) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-3 rounded-base border-2 transition-colors flex items-center gap-3 ${
                      selectedDoc?.id === doc.id ? 'border-border bg-secondary-background shadow-shadow' : 'border-transparent hover:border-border hover:bg-secondary-background'
                    }`}
                  >
                    <span className="text-foreground/60 font-mono text-sm">
                      {nextPrefix}
                      {idx === node.documents!.length - 1 ? '└── ' : '├── '}
                    </span>
                    <FileText className="w-3 h-3 text-foreground/60" />
                    <span className="text-foreground truncate text-base">{doc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Outline View Component (compact)
  const OutlineView = () => (
    <div className="space-y-1 p-3">
      {folderStructure.map((folder, idx) => (
        <TreeDiagramNode
          key={folder.path}
          node={folder}
          level={0}
          isLast={idx === folderStructure.length - 1}
          prefix=""
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-main animate-spin" />
          <p className="text-base">Loading document index...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <NeoCard className="text-center p-8">
          <p className="text-base mb-4">{error}</p>
          <NeoButton onClick={() => window.location.reload()}>
            Retry
          </NeoButton>
        </NeoCard>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-secondary-background border-b-2 border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading text-4xl md:text-5xl font-black">Gestión de Documentos</h1>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <NeoButton
              onClick={() => setViewMode('folder')}
              variant={viewMode === 'folder' ? 'default' : 'neutral'}
              size="sm"
              title="Folder View"
            >
              <List className="w-4 h-4" />
              Carpetas
            </NeoButton>
            <NeoButton
              onClick={() => setViewMode('tree')}
              variant={viewMode === 'tree' ? 'default' : 'neutral'}
              size="sm"
              title="Tree Diagram"
            >
              <Network className="w-4 h-4" />
              Árbol
            </NeoButton>
            <NeoButton
              onClick={() => setViewMode('outline')}
              variant={viewMode === 'outline' ? 'default' : 'neutral'}
              size="sm"
              title="Outline View"
            >
              <Grid3x3 className="w-4 h-4" />
              Esquema
            </NeoButton>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <NeoInput
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <NeoSelect
            value={selectedCategory || 'all'}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? null : e.target.value)}
            className="w-auto"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </NeoSelect>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4 text-base">
          <NeoBadge variant="neutral" className="px-4 py-2 text-base">
            Total: {documents.length}
          </NeoBadge>
          <NeoBadge variant="neutral" className="px-4 py-2 text-base">
            Mostrados: {filteredDocuments.length}
          </NeoBadge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Document Tree/List */}
        <div className="flex-1 overflow-auto border-r-2 border-border custom-scroll">
          {viewMode === 'folder' && (
            <div className="p-4 space-y-2">
              {folderStructure.length === 0 ? (
                <p className="text-foreground/50 text-center py-8 text-base">No documents found</p>
              ) : (
                folderStructure.map(folder => (
                  <FolderTreeNode key={folder.path} node={folder} level={0} />
                ))
              )}
            </div>
          )}

          {viewMode === 'tree' && (
            <div className="p-4">
              {folderStructure.length === 0 ? (
                <p className="text-foreground/50 text-center py-8 text-base">No documents found</p>
              ) : (
                folderStructure.map((folder, idx) => (
                  <TreeDiagramNode
                    key={folder.path}
                    node={folder}
                    level={0}
                    isLast={idx === folderStructure.length - 1}
                    prefix=""
                  />
                ))
              )}
            </div>
          )}

          {viewMode === 'outline' && <OutlineView />}
        </div>

        {/* Detail Panel */}
        {selectedDoc ? (
          <div className="min-w-80 max-w-96 bg-secondary-background border-l-2 border-border flex flex-col overflow-hidden">
            {/* Preview Button */}
            {selectedDoc.file_extension === '.pdf' && (
              <div className="p-3 border-b-2 border-border">
                <NeoButton
                  onClick={() => setShowPreview(true)}
                  variant="default"
                  className="w-full"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista previa
                </NeoButton>
              </div>
            )}
            {selectedDoc.file_extension === '.docx' && (
              <div className="p-3 border-b-2 border-border">
                <NeoBadge variant="outline" className="w-full justify-center text-base">
                  <FileText className="w-3.5 h-3.5" />
                  Vista previa no disponible para .docx
                </NeoBadge>
              </div>
            )}

            {/* Generate document button */}
            <div className="p-3 border-b-2 border-border">
              <NeoButton
                onClick={() => openGenerator(selectedDoc)}
                variant="default"
                className="w-full"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Generar documento
              </NeoButton>
            </div>

            {/* Document Info */}
            <div className="p-4 border-b-2 border-border overflow-auto custom-scroll">
              <div className="mb-4">
                <h2 className="font-heading text-lg font-bold mb-2 line-clamp-2">{selectedDoc.name}</h2>
                <p className="text-base text-foreground/70 truncate">{selectedDoc.category}</p>
                {selectedDoc.subcategory && (
                  <p className="text-base text-foreground/70 truncate">{selectedDoc.subcategory}</p>
                )}
                {selectedDoc.sub_subcategory && (
                  <p className="text-base text-foreground/70 truncate">{selectedDoc.sub_subcategory}</p>
                )}
              </div>

              <div className="space-y-2 text-base">
                <div>
                  <p className="text-foreground/60 uppercase tracking-wide">Especialización</p>
                  <p className="font-medium truncate">{selectedDoc.specialization}</p>
                </div>
                <div>
                  <p className="text-foreground/60 uppercase tracking-wide">Tipo</p>
                  <p className="font-medium">{selectedDoc.file_extension}</p>
                </div>
                <div>
                  <p className="text-foreground/60 uppercase tracking-wide">Tamaño</p>
                  <p className="font-medium">{(selectedDoc.file_size_bytes / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-foreground/60 uppercase tracking-wide">Modificado</p>
                  <p className="font-medium">{new Date(selectedDoc.modified_date).toLocaleDateString()}</p>
                </div>
                {selectedDoc.tags.length > 0 && (
                  <div>
                    <p className="text-foreground/60 uppercase tracking-wide mb-1">Etiquetas</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedDoc.tags.map((tag, idx) => (
                        <NeoBadge key={idx} variant="outline" className="px-3 py-1.5 text-xs truncate">
                          <Tag className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{tag}</span>
                        </NeoBadge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Leyes relacionadas */}
              {(() => {
                const related = LAWS.filter(law =>
                  law.relatedDocCategories.includes(selectedDoc.category)
                );
                if (related.length === 0) return null;
                return (
                  <NeoCard variant="outline" className="mt-4 p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-3.5 h-3.5 text-main flex-shrink-0" />
                      <h3 className="text-base font-black uppercase tracking-wide">
                        Leyes relacionadas
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {related.map(law => (
                        <a
                          key={law.id}
                          href={law.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-base text-foreground hover:text-main hover:bg-secondary-background rounded-base px-3 py-1.5 transition-colors group"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0 text-foreground/60 group-hover:text-main" />
                          <span className="truncate">{law.institution}</span>
                        </a>
                      ))}
                    </div>
                  </NeoCard>
                );
              })()}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-auto border-t-2 border-border p-3 flex flex-col custom-scroll">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                <h3 className="text-base font-semibold">Comentarios ({selectedDoc.comments.length})</h3>
              </div>

              <div className="flex-1 overflow-auto mb-3 space-y-2 custom-scroll">
                {selectedDoc.comments.length === 0 ? (
                  <p className="text-base text-foreground/50 italic">Sin comentarios</p>
                ) : (
                  selectedDoc.comments.map((cmt, idx) => (
                    <NeoCard key={idx} className="p-4">
                      <p className="text-base text-foreground/60 mb-1">{cmt.author || 'Anónimo'}</p>
                      <p className="text-base text-foreground line-clamp-3">{cmt.text}</p>
                      {cmt.created_at && (
                        <p className="text-base text-foreground/50 mt-1">{new Date(cmt.created_at).toLocaleDateString()}</p>
                      )}
                    </NeoCard>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <NeoInput
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Agregar comentario..."
                  className="flex-1"
                />
                <NeoButton
                  onClick={handleAddComment}
                >
                  Enviar
                </NeoButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-w-80 bg-secondary-background border-l-2 border-border flex items-center justify-center">
            <p className="text-foreground/50 text-center px-4 text-base">
              Selecciona un documento para ver detalles
            </p>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPreview && selectedDoc && selectedDoc.file_extension === '.pdf' && (
          <div
            className={`fixed inset-0 z-50 flex bg-overlay p-4 ${previewMaximized ? '' : 'items-center justify-center'}`}
            onClick={() => setShowPreview(false)}
          >
            <NeoCard
              className={`w-full flex flex-col overflow-hidden p-0 ${previewMaximized ? 'h-full max-w-none' : 'max-w-4xl h-[80vh]'}`}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b-2 border-border flex-shrink-0">
                <span className="text-base font-medium truncate">{selectedDoc.name}</span>
                <div className="flex items-center gap-1">
                  <NeoButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setPreviewMaximized((v) => !v)}
                    title={previewMaximized ? 'Restaurar tamaño' : 'Pantalla completa'}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </NeoButton>
                  <NeoButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPreview(false)}
                  >
                    <X className="w-4 h-4" />
                  </NeoButton>
                </div>
              </div>
              {previewLoading ? (
                <div className="flex flex-1 items-center justify-center text-foreground/50">
                  <Loader size={32} className="animate-spin" />
                </div>
              ) : previewBlobUrl ? (
                <object
                  data={previewBlobUrl}
                  type="application/pdf"
                  className="flex-1 w-full border-0"
                  aria-label={selectedDoc.name}
                >
                  <p className="text-foreground/50 text-center mt-8">
                    Tu navegador no puede mostrar PDFs.
                    <a href={previewBlobUrl} download={selectedDoc.name} className="underline text-main ml-2">
                      Descargar
                    </a>
                  </p>
                </object>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-foreground/50">
                  <FileText size={40} className="mb-2 opacity-40" />
                  <p className="text-base">No se pudo cargar la vista previa</p>
                </div>
              )}
            </NeoCard>
          </div>
        )}

        {/* Document Generator Modal */}
        {showGenerator && generatorTemplate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeGenerator}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-base border-2 border-border bg-background shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b-2 border-border bg-secondary-background px-4 py-3">
                <div className="min-w-0">
                  <h3 className="font-heading text-lg font-black truncate">Generar documento</h3>
                  <p className="text-sm text-foreground/70 truncate">{generatorTemplate.name}</p>
                </div>
                <button
                  onClick={closeGenerator}
                  className="rounded-base border-2 border-border bg-secondary-background p-1.5 text-foreground hover:bg-main hover:text-main-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="custom-scroll flex-1 overflow-y-auto p-4">
                {generatorStep === 'client' && (
                  <div className="space-y-4">
                    <p className="text-base text-foreground/80">
                      Selecciona el cliente para vincular este documento. Los empleados solo ven los clientes asignados a ellos.
                    </p>
                    <div>
                      <label className="mb-1 block font-base text-sm font-semibold text-foreground/80">
                        <Users className="w-4 h-4 inline mr-1" />
                        Cliente *
                      </label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-base text-sm text-foreground outline-none focus:border-main"
                      >
                        <option value="">Selecciona un cliente</option>
                        {generatorClients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name || client.phone} ({client.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                    <NeoButton
                      onClick={loadTemplateFields}
                      disabled={!selectedClientId || generatorLoading}
                      className="w-full"
                    >
                      {generatorLoading ? (
                        <Loader className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-1" />
                      )}
                      Continuar
                    </NeoButton>
                  </div>
                )}

                {generatorStep === 'fields' && (
                  <div className="space-y-5">
                    <p className="text-sm text-foreground/70">
                      Completa los datos requeridos. El documento se guardará automáticamente en el expediente del cliente con control de versiones.
                    </p>

                    {Object.entries(templateRoles).map(([role, fields]) => (
                      <NeoCard key={role} variant="neutral" className="p-4 space-y-3">
                        <p className="font-base text-sm font-black uppercase tracking-wider text-foreground/70">
                          Rol: {role}
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {fields.map((field) => (
                            <div key={`${role}-${field}`}>
                              <label className="mb-1 block text-sm font-semibold text-foreground/80">
                                {field.replace(/_/g, ' ')}
                              </label>
                              <input
                                type="text"
                                value={assignedRoles[role]?.[field] || ''}
                                onChange={(e) => updateRoleField(role, field, e.target.value)}
                                placeholder={`Ingresa ${field.replace(/_/g, ' ').toLowerCase()}`}
                                className="w-full rounded-base border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-main"
                              />
                            </div>
                          ))}
                        </div>
                      </NeoCard>
                    ))}

                    {nonRoleVariables.length > 0 && (
                      <NeoCard variant="neutral" className="p-4 space-y-3">
                        <p className="font-base text-sm font-black uppercase tracking-wider text-foreground/70">
                          Datos adicionales
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {nonRoleVariables.map((v) => (
                            <div key={v.tag}>
                              <label className="mb-1 block text-sm font-semibold text-foreground/80">
                                {v.description || v.tag.replace(/_/g, ' ')}
                                {v.is_required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <input
                                type="text"
                                value={collectedData[v.tag] || ''}
                                onChange={(e) => updateCollectedField(v.tag, e.target.value)}
                                placeholder={`Ingresa ${(v.description || v.tag).toLowerCase()}`}
                                className="w-full rounded-base border-2 border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-main"
                              />
                            </div>
                          ))}
                        </div>
                      </NeoCard>
                    )}

                    {generatorError && (
                      <p className="text-sm text-red-600">{generatorError}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <NeoButton
                        variant="neutral"
                        onClick={() => setGeneratorStep('client')}
                        disabled={generatorLoading}
                      >
                        Atrás
                      </NeoButton>
                      <NeoButton
                        onClick={handleGenerateDocument}
                        disabled={generatorLoading}
                        className="flex-1"
                      >
                        {generatorLoading ? (
                          <Loader className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4 mr-1" />
                        )}
                        Generar documento
                      </NeoButton>
                    </div>
                  </div>
                )}

                {generatorStep === 'done' && (
                  <div className="space-y-5 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-main text-main-foreground shadow-button">
                      <FileText size={28} />
                    </div>
                    <h4 className="font-heading text-xl font-black">Documento generado</h4>
                    <p className="text-base text-foreground/80">
                      El documento se guardó en el expediente del cliente. Puedes descargarlo ahora.
                    </p>
                    {generatedDownloadUrl && (
                      <NeoButton
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = generatedDownloadUrl;
                          a.download = `${generatorTemplate.name}.docx`;
                          a.click();
                        }}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Descargar documento
                      </NeoButton>
                    )}
                    <NeoButton variant="neutral" onClick={closeGenerator} className="w-full">
                      Cerrar
                    </NeoButton>
                  </div>
                )}

                {generatorStep === 'error' && (
                  <div className="space-y-4 text-center">
                    <p className="text-red-600 font-semibold">No se pudo generar el documento</p>
                    <p className="text-sm text-foreground/70">{generatorError}</p>
                    <NeoButton onClick={() => setGeneratorStep('fields')} variant="neutral">
                      Intentar de nuevo
                    </NeoButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
