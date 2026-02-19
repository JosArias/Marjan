import { getRiskLabel } from '../../lib/constants'
export default function RiskMatrix({ risks }) {
  const sorted = [...risks].sort((a, b) => b.risk_score - a.risk_score)
  function cellColor(score) {
    if (score <= 5) return '#dcfce7'
    if (score <= 11) return '#fef3c7'
    if (score <= 19) return '#fee2e2'
    return '#fce7f3'
  }
  const grid = Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>({
    prob:j+1, impact:5-i, score:(j+1)*(5-i),
    risks: risks.filter(r=>r.probability===j+1 && r.impact===5-i)
  })))
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-gray-400 mb-2">Impact (Y-axis, top=5) × Probability (X-axis, right=5)</p>
        <div className="inline-grid gap-0.5" style={{gridTemplateColumns:'repeat(5,2.25rem)'}}>
          {grid.flat().map(({prob,impact,score,risks:cr})=>(
            <div key={`${prob}-${impact}`}
              className="w-9 h-9 rounded flex items-center justify-center text-xs font-bold border"
              style={{backgroundColor:cellColor(score),borderColor:cellColor(score)}}
              title={cr.map(r=>r.title).join(', ')}>
              {cr.length>0 ? <span className="text-gray-800">{cr.length}</span>
                           : <span className="text-gray-300 text-xs">{score}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map(risk => {
          const lbl = getRiskLabel(risk.risk_score)
          return (
            <div key={risk.id} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <span className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0"
                style={{backgroundColor:lbl.bg,color:lbl.color}}>
                {risk.risk_score} {lbl.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{risk.title}</p>
                {risk.description && <p className="text-xs text-gray-500 mt-0.5">{risk.description}</p>}
                <p className="text-xs text-gray-400 mt-1">P:{risk.probability} × I:{risk.impact} · {risk.status}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
