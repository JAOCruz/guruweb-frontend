import { useEffect, useState, useMemo } from 'react';
import { botAPI, DocumentIndexItem } from '../services/botApi';
import { Search, ChevronDown, ChevronRight, FileText, Folder, Tag, MessageCircle, Loader, List, Network, Grid3x3, Scale, ExternalLink, Eye, X } from 'lucide-react';
import { LAWS } from '../data/laws';

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
              className="w-full flex items-center gap-2 p-2 hover:bg-slate-800/50 transition-colors text-left"
              style={{ marginLeft: `${level * 16}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-blue-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="font-medium text-sm">{node.name}</span>
              {totalItems > 0 && (
                <span className="text-xs text-slate-400 ml-auto">
                  {totalItems}
                </span>
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
                        className={`w-full flex items-center gap-2 p-2 hover:bg-slate-800/50 transition-colors text-left border-b border-slate-800/50 last:border-b-0 ${
                          selectedDoc?.id === doc.id ? 'bg-blue-600/20 border-l-2 border-l-blue-500' : ''
                        }`}
                        style={{ marginLeft: `${(level + 1) * 16 + 20}px` }}
                      >
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <p className="text-sm font-medium truncate">{doc.name}</p>
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
      <div key={node.path} className="font-mono text-sm">
        <button
          onClick={() => toggleFolder(node.path)}
          className="w-full text-left p-2 hover:bg-slate-800/50 transition-colors flex items-center gap-2"
        >
          <span className="text-slate-400">{prefix}{connector}</span>
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-blue-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-slate-500" />
          )}
          <Folder className="w-3 h-3 text-blue-500" />
          <span className="text-slate-300">{node.name}</span>
          {hasDocuments && <span className="text-xs text-slate-500 ml-auto">({node.documents!.length})</span>}
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
                    className={`w-full text-left p-2 hover:bg-slate-800/50 transition-colors flex items-center gap-2 ${
                      selectedDoc?.id === doc.id ? 'bg-blue-600/20' : ''
                    }`}
                  >
                    <span className="text-slate-400">
                      {nextPrefix}
                      {idx === node.documents!.length - 1 ? '└── ' : '├── '}
                    </span>
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-300 truncate text-xs">{doc.name}</span>
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
    <div className="space-y-1 p-2">
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
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-300">Loading document index...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Gestión de Documentos</h1>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('folder')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'folder'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Folder View"
            >
              <List className="w-4 h-4" />
              Carpetas
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Tree Diagram"
            >
              <Network className="w-4 h-4" />
              Árbol
            </button>
            <button
              onClick={() => setViewMode('outline')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'outline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Outline View"
            >
              <Grid3x3 className="w-4 h-4" />
              Esquema
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <select
            value={selectedCategory || 'all'}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? null : e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded focus:border-blue-500 focus:outline-none transition-colors"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4 text-sm">
          <div className="bg-slate-800 rounded px-3 py-1">
            <span className="text-slate-400">Total: </span>
            <span className="font-semibold">{documents.length}</span>
          </div>
          <div className="bg-slate-800 rounded px-3 py-1">
            <span className="text-slate-400">Mostrados: </span>
            <span className="font-semibold">{filteredDocuments.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Document Tree/List */}
        <div className="flex-1 overflow-auto border-r border-slate-800">
          {viewMode === 'folder' && (
            <div className="p-4 space-y-2">
              {folderStructure.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No documents found</p>
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
                <p className="text-slate-400 text-center py-8">No documents found</p>
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
          <div className="min-w-80 max-w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
            {/* Preview Button */}
            {selectedDoc.file_extension === '.pdf' && (
              <div className="p-3 border-b border-slate-800">
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3
                           bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30
                           text-blue-300 rounded text-xs font-medium transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista previa
                </button>
              </div>
            )}
            {selectedDoc.file_extension === '.docx' && (
              <div className="p-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 py-1 px-2
                            bg-slate-800/50 rounded border border-slate-700/50">
                  <FileText className="w-3.5 h-3.5" />
                  Vista previa no disponible para .docx
                </div>
              </div>
            )}

            {/* Document Info */}
            <div className="p-4 border-b border-slate-800 overflow-auto">
              <div className="mb-4">
                <h2 className="text-base font-bold text-white mb-2 line-clamp-2">{selectedDoc.name}</h2>
                <p className="text-xs text-slate-400 truncate">{selectedDoc.category}</p>
                {selectedDoc.subcategory && (
                  <p className="text-xs text-slate-400 truncate">{selectedDoc.subcategory}</p>
                )}
                {selectedDoc.sub_subcategory && (
                  <p className="text-xs text-slate-400 truncate">{selectedDoc.sub_subcategory}</p>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-500 uppercase tracking-wide">Especialización</p>
                  <p className="font-medium truncate">{selectedDoc.specialization}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wide">Tipo</p>
                  <p className="font-medium">{selectedDoc.file_extension}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wide">Tamaño</p>
                  <p className="font-medium">{(selectedDoc.file_size_bytes / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wide">Modificado</p>
                  <p className="font-medium">{new Date(selectedDoc.modified_date).toLocaleDateString()}</p>
                </div>
                {selectedDoc.tags.length > 0 && (
                  <div>
                    <p className="text-slate-500 uppercase tracking-wide mb-1">Etiquetas</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedDoc.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-0.5 bg-blue-500/20 text-blue-300 text-xs px-1.5 py-0.5 rounded border border-blue-500/30 truncate">
                          <Tag className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{tag}</span>
                        </span>
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
                  <div className="p-4 border-t border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
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
                          className="flex items-center gap-2 text-xs text-slate-300 hover:text-blue-300
                                   hover:bg-slate-800/50 rounded px-2 py-1.5 transition-colors group"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0 text-slate-500 group-hover:text-blue-400" />
                          <span className="truncate">{law.institution}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-auto border-t border-slate-800 p-3 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <h3 className="text-xs font-semibold">Comentarios ({selectedDoc.comments.length})</h3>
              </div>

              <div className="flex-1 overflow-auto mb-3 space-y-2">
                {selectedDoc.comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Sin comentarios</p>
                ) : (
                  selectedDoc.comments.map((cmt, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded p-2">
                      <p className="text-xs text-slate-400 mb-1">{cmt.author || 'Anónimo'}</p>
                      <p className="text-xs text-slate-200 line-clamp-3">{cmt.text}</p>
                      {cmt.created_at && (
                        <p className="text-xs text-slate-500 mt-1">{new Date(cmt.created_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-1">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Agregar comentario..."
                  className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs px-2 py-1.5 rounded focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors flex-shrink-0"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-w-80 bg-slate-900 border-l border-slate-800 flex items-center justify-center">
            <p className="text-slate-500 text-center px-4">
              Selecciona un documento para ver detalles
            </p>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPreview && selectedDoc && selectedDoc.file_extension === '.pdf' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowPreview(false)}
          >
            <div
              className="w-full max-w-4xl h-[80vh] bg-slate-900 rounded-xl border border-slate-700
                         flex flex-col overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-slate-700 flex-shrink-0">
                <span className="text-sm font-medium text-white truncate">{selectedDoc.name}</span>
                <button onClick={() => setShowPreview(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <iframe
                src={botAPI.getDocumentFileUrl(selectedDoc.id)}
                className="flex-1 w-full border-0"
                title={selectedDoc.name}
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
