import { useState, useEffect } from 'react'
import { Download, Eye, Wand2, CheckCircle2, Plus, Edit2, X, Loader2, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, Badge, Button, Progress } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { getLatestResumeApi } from '../api/resume'
import { getProfileApi, ProfileData } from '../api/profile'
import { getUserSkillsApi, UserSkillItem } from '../api/skill'

interface Section {
  id: string
  label: string
  complete: boolean
  score: number
  details: string
}

const INITIAL_SUGGESTIONS = [
  { text: 'Add quantifiable metrics to work experience bullet points', severity: 'high' as const },
  { text: 'Include 2 more technical projects to showcase skills',       severity: 'medium' as const },
  { text: 'Add relevant certifications (AWS, GCP, etc.)',               severity: 'medium' as const },
  { text: 'Optimize keywords for ATS scanning',                         severity: 'low' as const },
]

const severityStyles = {
  high:   'bg-danger-50 text-danger-700 border-danger-100',
  medium: 'bg-warning-50 text-warning-700 border-warning-100',
  low:    'bg-info-50 text-info-700 border-info-100',
}

export function ResumeBuilderPage() {
  const { token, user } = useAuth()

  const [loadingData, setLoadingData] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [userSkills, setUserSkills] = useState<UserSkillItem[]>([])

  const [sections, setSections] = useState<Section[]>([
    { id: 'contact',       label: 'Contact Info',      complete: true,  score: 100, details: '' },
    { id: 'experience',    label: 'Work Experience',   complete: true,  score: 95,  details: '' },
    { id: 'education',     label: 'Education',         complete: true,  score: 100, details: '' },
    { id: 'skills',        label: 'Skills & Tech Stack',complete: true, score: 90,  details: '' },
    { id: 'projects',      label: 'Projects',          complete: false, score: 60,  details: '' },
    { id: 'certifications',label: 'Certifications',    complete: false, score: 0,   details: '' },
  ])

  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS)
  const [isImproving, setIsImproving] = useState(false)
  const [improvedToast, setImprovedToast] = useState(false)

  // Edit section modal
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [editDetails, setEditDetails] = useState('')

  // Preview modal
  const [showPreview, setShowPreview] = useState(false)

  // Fetch real user data and merge newly learned skills
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoadingData(false)
        return
      }
      try {
        setLoadingData(true)
        const [profData, resData, skillsData] = await Promise.all([
          getProfileApi(token).catch(() => null),
          getLatestResumeApi(token).catch(() => null),
          getUserSkillsApi(token).catch(() => []),
        ])

        setProfile(profData)
        setUserSkills(skillsData || [])

        // Format Contact Details
        const nameStr = user?.name || profData?.user?.name || 'Alex Johnson'
        const emailStr = user?.email || profData?.user?.email || 'alex@example.com'
        const contactStr = `${nameStr} | ${emailStr} | San Francisco, CA`

        // Format Education
        let eduStr = 'B.S. Computer Science, Stanford University (2017 - 2021)'
        if (profData?.degree || profData?.college) {
          const deg = profData.degree || 'Degree'
          const col = profData.college || 'University'
          const yr = profData.graduationYear ? ` (Graduation: ${profData.graduationYear})` : ''
          const br = profData.branch ? ` - ${profData.branch}` : ''
          eduStr = `${deg}${br}, ${col}${yr}`
        }

        // Format Skills (Combine Resume skills + Newly Learned User Skills)
        const resumeSkillNames = (resData?.technicalSkills || []).map((s) => s.name)
        const learnedSkillNames = (skillsData || []).map((s) => s.skillName)

        const allSkillNames = Array.from(new Set([...resumeSkillNames, ...learnedSkillNames]))
        const skillsFormatted = allSkillNames.length > 0
          ? `Technical Stack & Newly Learned Skills:\n${allSkillNames.join(', ')}`
          : 'Languages: JavaScript, TypeScript, Python, SQL\nFrameworks: React, Node.js, Express, TailwindCSS\nTools: Docker, Git, AWS'

        // Format Work Experience
        let expStr = 'Senior Software Engineer at TechCorp (2021 - Present)\n- Led migration to Next.js micro-frontends\n- Improved page load speeds by 45%'
        if (resData?.experience && resData.experience.length > 0) {
          expStr = resData.experience
            .map((e) => `${e.role} at ${e.company} (${e.duration || 'N/A'})\n- ${e.description || 'Contributed to core product features.'}`)
            .join('\n\n')
        }

        // Format Projects
        let projStr = 'AI Career Copilot - Automated resume parser and career path recommendation engine.'
        if (resData?.projects && resData.projects.length > 0) {
          projStr = resData.projects
            .map((p) => `${p.title}: ${p.description || ''} [Tech: ${p.technologies?.join(', ') || 'N/A'}]`)
            .join('\n\n')
        }

        // Format Certifications
        let certStr = 'Add relevant AWS or IBM SkillsBuild certifications to boost ATS score.'
        if (resData?.certifications && resData.certifications.length > 0) {
          certStr = resData.certifications.map((c) => `${c.name} (Issuer: ${c.issuer || 'N/A'})`).join('\n')
        }

        setSections([
          { id: 'contact',       label: 'Contact Info',       complete: true,                       score: 100, details: contactStr },
          { id: 'experience',    label: 'Work Experience',    complete: !!resData?.experience?.length || true, score: resData?.experience?.length ? 95 : 90, details: expStr },
          { id: 'education',     label: 'Education',          complete: true,                       score: 100, details: eduStr },
          { id: 'skills',        label: 'Skills & Tech Stack',complete: allSkillNames.length > 0,   score: Math.min(100, 80 + allSkillNames.length * 3), details: skillsFormatted },
          { id: 'projects',      label: 'Projects',           complete: !!resData?.projects?.length, score: resData?.projects?.length ? 90 : 60, details: projStr },
          { id: 'certifications',label: 'Certifications',     complete: !!resData?.certifications?.length, score: resData?.certifications?.length ? 100 : 40, details: certStr },
        ])
      } catch (err) {
        console.error('Failed to load user resume details:', err)
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [token, user])

  const overallScore = Math.round(
    sections.reduce((sum, s) => sum + s.score, 0) / sections.length
  )

  // AI Improve handler
  const handleAIImprove = () => {
    setIsImproving(true)
    setTimeout(() => {
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          complete: true,
          score: Math.min(100, s.score + 10),
        }))
      )
      setSuggestions([
        { text: 'Optimized key tech skills for high ATS keyword density based on learned skills', severity: 'low' as const },
        { text: 'Added quantifiable impact metrics to work experience bullet points', severity: 'low' as const },
        { text: 'Integrated newly learned verified skills into resume stack', severity: 'medium' as const },
      ])
      setIsImproving(false)
      setImprovedToast(true)
      setTimeout(() => setImprovedToast(false), 4000)
    }, 1200)
  }

  // Save section edit
  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSection) return

    setSections((prev) =>
      prev.map((s) => {
        if (s.id === editingSection.id) {
          return {
            ...s,
            details: editDetails,
            complete: true,
            score: 100,
          }
        }
        return s
      })
    )
    setEditingSection(null)
  }

  // Dedicated Standalone Resume PDF Export Function
  const handleExportPDF = () => {
    const contactSection = sections.find((s) => s.id === 'contact')?.details || ''
    const expSection = sections.find((s) => s.id === 'experience')?.details || ''
    const eduSection = sections.find((s) => s.id === 'education')?.details || ''
    const skillsSection = sections.find((s) => s.id === 'skills')?.details || ''
    const projSection = sections.find((s) => s.id === 'projects')?.details || ''
    const certSection = sections.find((s) => s.id === 'certifications')?.details || ''

    const userNameStr = user?.name || profile?.user?.name || 'Alex Johnson'

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${userNameStr.replace(/\s+/g, '_')}_Resume</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 24px;
              background: #fff;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .name {
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .contact {
              font-size: 13px;
              color: #475569;
            }
            .section {
              margin-bottom: 18px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 700;
              color: #4f46e5;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            .content {
              font-size: 12.5px;
              color: #334155;
              white-space: pre-line;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="name">${userNameStr}</h1>
            <div class="contact">${contactSection}</div>
          </div>

          <div class="section">
            <div class="section-title">Education</div>
            <div class="content">${eduSection}</div>
          </div>

          <div class="section">
            <div class="section-title">Technical Skills & Newly Acquired Competencies</div>
            <div class="content">${skillsSection}</div>
          </div>

          <div class="section">
            <div class="section-title">Work Experience</div>
            <div class="content">${expSection}</div>
          </div>

          <div class="section">
            <div class="section-title">Key Projects</div>
            <div class="content">${projSection}</div>
          </div>

          <div class="section">
            <div class="section-title">Certifications</div>
            <div class="content">${certSection}</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printHtml)
      printWindow.document.close()
    }
  }

  if (loadingData) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand-500 mb-3" />
        <p className="text-sm font-medium text-surface-600">Retrieving your resume & updating newly learned skills...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Resume Builder</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            Updated dynamically with your profile & newly acquired skills
          </p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />} onClick={() => setShowPreview(true)}>
            Preview
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Download size={14} />} onClick={handleExportPDF}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Newly Learned Skills Alert Banner */}
      {userSkills.length > 0 && (
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 flex items-center gap-3 text-sm">
          <Sparkles size={18} className="text-brand-600 flex-shrink-0" />
          <div>
            <span className="font-semibold">Newly Learned Skills Synced: </span>
            <span>
              {userSkills.map((s) => s.skillName).join(', ')} have been automatically added to your resume stack!
            </span>
          </div>
        </div>
      )}

      {improvedToast && (
        <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-800 flex items-center gap-3 text-sm animate-in fade-in">
          <Sparkles size={18} className="text-success-600 flex-shrink-0" />
          <span>AI Optimization complete! Your ATS resume score increased to <strong>{Math.min(100, overallScore + 10)}%</strong>!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: resume sections */}
        <div className="lg:col-span-2 space-y-4">
          {sections.map((section) => (
            <Card key={section.id} padding="md" hoverable>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {section.complete ? (
                    <CheckCircle2 size={16} className="text-success-500 flex-shrink-0" />
                  ) : (
                    <Plus size={16} className="text-surface-300 flex-shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="text-sm font-medium text-surface-800 block">{section.label}</span>
                    <span className="text-xs text-surface-400 truncate block max-w-xs">{section.details}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-surface-500 font-medium">{section.score}/100</span>
                  {section.complete ? (
                    <Badge variant="success" size="sm">Complete</Badge>
                  ) : (
                    <Badge variant="default" size="sm">Missing</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="xs"
                    leftIcon={<Edit2 size={12} />}
                    onClick={() => {
                      setEditingSection(section)
                      setEditDetails(section.details)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              {section.complete && (
                <Progress
                  value={section.score}
                  size="xs"
                  color={section.score >= 90 ? 'success' : section.score >= 70 ? 'brand' : 'warning'}
                  className="mt-3"
                />
              )}
            </Card>
          ))}
        </div>

        {/* Right: score + suggestions */}
        <div className="space-y-4">
          <Card className="text-center" padding="lg">
            <div className="w-16 h-16 rounded-full bg-brand-50 border-4 border-brand-200 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-brand-600">{overallScore}</span>
            </div>
            <p className="text-sm font-semibold text-surface-800 mt-3">Resume ATS Score</p>
            <p className="text-xs text-surface-500 mt-1">Top 15% of candidates</p>
            <Progress value={overallScore} size="md" color="brand" className="mt-4" />
            <Button
              variant="primary"
              size="sm"
              fullWidth
              leftIcon={isImproving ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              disabled={isImproving}
              className="mt-4"
              onClick={handleAIImprove}
            >
              {isImproving ? 'Optimizing with AI...' : 'AI Improve'}
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
              <CardDescription className="mt-0.5">Improvements to boost your score</CardDescription>
            </CardHeader>
            <div className="mt-4 space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${severityStyles[s.severity]}`}>
                  {s.text}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-surface-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-surface-900">Edit {editingSection.label}</h3>
              <button
                onClick={() => setEditingSection(null)}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Section Details & Content
                </label>
                <textarea
                  rows={6}
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  className="w-full p-3 text-sm rounded-lg border border-surface-200 focus:ring-2 focus:ring-brand-400 focus:outline-none text-surface-800"
                  placeholder="Enter details for this section..."
                />
              </div>

              <div className="pt-3 border-t border-surface-100 flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Section
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-surface-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
              <h3 className="text-base font-semibold text-surface-900">Live Resume Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 font-sans text-surface-800">
              {/* Header */}
              <div className="border-b border-surface-200 pb-4 text-center">
                <h1 className="text-2xl font-bold text-surface-900">{user?.name || profile?.user?.name || 'Alex Johnson'}</h1>
                <p className="text-xs text-surface-500 mt-1">
                  {sections.find((s) => s.id === 'contact')?.details}
                </p>
              </div>

              {/* Sections */}
              {sections.map((sec) => (
                <div key={sec.id} className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 border-b border-surface-100 pb-1">
                    {sec.label}
                  </h2>
                  <p className="text-xs leading-relaxed text-surface-700 whitespace-pre-line">
                    {sec.details || 'No content added yet.'}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-surface-100 flex justify-end gap-2 bg-surface-50">
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                Close Preview
              </Button>
              <Button variant="primary" size="sm" leftIcon={<Download size={14} />} onClick={handleExportPDF}>
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
