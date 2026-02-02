import { useState } from 'react'

function HowItWorks() {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="card p-6 mb-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                    📖 How It Works
                </h2>
                <span
                    className="text-2xl transition-transform"
                    style={{
                        color: 'var(--color-text-muted)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                    }}
                >
                    ▾
                </span>
            </button>

            {isExpanded && (
                <div className="mt-6 fade-in" style={{ color: 'var(--color-text-secondary)' }}>
                    {/* What is ABOM */}
                    <Section title="What is an ABOM?">
                        <p>
                            An <strong>Agentic Bill of Materials (ABOM)</strong> is a machine-readable manifest
                            that describes everything an AI agent can do. Think of it like a nutrition label,
                            but for AI capabilities.
                        </p>
                        <p className="mt-2">
                            It captures: what tools the agent has access to, how much human oversight is involved,
                            and whether it can remember things across sessions.
                        </p>
                    </Section>

                    {/* The Three Risk Factors */}
                    <Section title="The Three Risk Factors">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <FactorCard
                                letter="A"
                                name="Agency"
                                description="What can the agent do?"
                                levels={[
                                    "1 = No tools (just text)",
                                    "2 = Read-only tools",
                                    "4 = Can modify things",
                                    "6 = Dangerous capabilities"
                                ]}
                            />
                            <FactorCard
                                letter="U"
                                name="Autonomy"
                                description="How much human oversight?"
                                levels={[
                                    "1 = Human approves every action",
                                    "2 = Human monitors and can intervene",
                                    "3 = Fully autonomous"
                                ]}
                            />
                            <FactorCard
                                letter="P"
                                name="Persistence"
                                description="What does it remember?"
                                levels={[
                                    "0 = Nothing (ephemeral)",
                                    "1 = Current session only",
                                    "2 = Long-term memory"
                                ]}
                            />
                        </div>
                    </Section>

                    {/* The Formula */}
                    <Section title="Risk Score Formula">
                        <div
                            className="formula-box text-center"
                            style={{ fontSize: '1.25rem' }}
                        >
                            R = A × U × e<sup>P</sup> × modifier
                        </div>
                        <p className="mt-3 text-sm">
                            The exponential (e<sup>P</sup>) means persistence has an outsized impact on risk.
                            An agent that remembers and learns over time is fundamentally more powerful than
                            an ephemeral one.
                        </p>
                    </Section>

                    {/* UART Tiers */}
                    <Section title="UART Tiers">
                        <p className="mb-3">
                            The <strong>Unified Agentic Risk Tiering (UART)</strong> framework maps
                            risk scores to governance levels:
                        </p>
                        <div className="overflow-x-auto">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                        <th style={{ textAlign: 'left', padding: '8px' }}>Tier</th>
                                        <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '8px' }}>Score</th>
                                        <th style={{ textAlign: 'left', padding: '8px' }}>Governance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <TierRow tier={0} name="Passive" range="= 0" governance="Minimal oversight" color="var(--tier-0)" />
                                    <TierRow tier={1} name="Assistive" range="0–5" governance="Basic logging" color="var(--tier-1)" />
                                    <TierRow tier={2} name="Bounded" range="5–20" governance="Regular audits" color="var(--tier-2)" />
                                    <TierRow tier={3} name="High-Agency" range="20–50" governance="Real-time monitoring" color="var(--tier-3)" />
                                    <TierRow tier={4} name="Systemic" range="≥ 50" governance="Regulatory approval required" color="var(--tier-4)" />
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* Safety Controls */}
                    <Section title="Safety Controls (Scaffolding)">
                        <p className="mb-3">
                            Good safety practices reduce your risk score:
                        </p>
                        <ul style={{ paddingLeft: '1.25rem', listStyle: 'disc' }}>
                            <li><strong>MCP (Model Context Protocol):</strong> 10% reduction</li>
                            <li><strong>Sandboxing:</strong> 15% reduction</li>
                            <li><strong>Kill switches / Circuit breakers:</strong> 10% reduction</li>
                        </ul>
                        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            Maximum combined reduction: 30%
                        </p>
                    </Section>

                    {/* Automatic Overrides */}
                    <Section title="Automatic Tier 4 Overrides">
                        <p>
                            Some capabilities are so dangerous that they automatically trigger <strong>Tier 4</strong>,
                            regardless of the calculated score:
                        </p>
                        <ul className="mt-2" style={{ paddingLeft: '1.25rem', listStyle: 'disc' }}>
                            <li>Training compute ≥ 10<sup>25</sup> FLOPs (EU AI Act threshold)</li>
                            <li>Self-replication or autonomous spread</li>
                            <li>CBRN (chemical, biological, radiological, nuclear) access</li>
                            <li>Critical infrastructure control</li>
                        </ul>
                    </Section>
                </div>
            )}
        </div>
    )
}

function Section({ title, children }) {
    return (
        <div className="mb-6">
            <h3
                className="text-lg mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
                {title}
            </h3>
            {children}
        </div>
    )
}

function FactorCard({ letter, name, description, levels }) {
    return (
        <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
        >
            <div className="flex items-center gap-2 mb-2">
                <span
                    className="mono text-xl font-bold"
                    style={{ color: 'var(--color-accent)' }}
                >
                    {letter}
                </span>
                <span className="font-semibold">{name}</span>
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                {description}
            </p>
            <ul className="text-xs" style={{ paddingLeft: '1rem', listStyle: 'disc', color: 'var(--color-text-secondary)' }}>
                {levels.map((level, idx) => (
                    <li key={idx}>{level}</li>
                ))}
            </ul>
        </div>
    )
}

function TierRow({ tier, name, range, governance, color }) {
    return (
        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            <td style={{ padding: '8px' }}>
                <span
                    className="tier-badge"
                    style={{
                        backgroundColor: `${color}20`,
                        color: color,
                        border: `1px solid ${color}`,
                        padding: '2px 8px',
                        fontSize: '0.75rem'
                    }}
                >
                    {tier}
                </span>
            </td>
            <td style={{ padding: '8px', fontWeight: 500 }}>{name}</td>
            <td style={{ padding: '8px' }} className="mono">{range}</td>
            <td style={{ padding: '8px' }}>{governance}</td>
        </tr>
    )
}

export default HowItWorks
