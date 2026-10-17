export const COGNITIVE_CARD_VERSION="attachment-cognitive-cards-v1";
export const COGNITIVE_SOURCE_DIGEST="sha256:fde0c8bcccea08231389591ea379654563dc39bdcd9d2cbb9f7a19016a716166";

export const POWER_KEYS=[
"first_principles","scenario_simulation","hidden_patterns","inversion","systems_thinking",
"bayesian_calibration","analogy_transfer","adversary_simulation","second_order","fermi_estimation",
"dialectic_synthesis","edge_case_hunting","essence_compression","constraint_alchemy","deep_time",
"incentive_engineering","counterfactual","model_lattice","abductive_detective","causal_inference",
"leverage_points","perspective_multiplex","optionality","fallacy_radar","scale_shifting",
"reframing","thought_experiments","emergence","decision_architecture","narrative_cognition"
];

export const STANCE_KEYS=[
"stoic","methodical_skeptic","anxious_guardian","obsessive_perfectionist","hypomanic_visionary",
"depressive_realist","contrarian_rebel","strategic_optimist","paranoid_strategist","hyperfocus_systemizer",
"associative_leaper","deep_empath","icy_analyst","contemplative_dreamer","bold_adventurer",
"beginner_mind","majestic_confident","vigilant_survivor","playful_trickster","ascetic_minimalist",
"competitive_warrior","traditional_guardian","sleepless_ruminator","serene_seer"
];

export const SCHOOL_KEYS=[
"rationalist","empiricist","pragmatist","dialectic","systems",
"bayesian","evolutionary","structuralist","phenomenological","practical_wisdom"
];

export const STANCE_COMPENSATION={
methodical_skeptic:"Steelman the strongest version before rejecting it and state what evidence would prove it.",
anxious_guardian:"Assign approximate probability to feared outcomes and include the cost of over-caution.",
hypomanic_visionary:"Rank ideas by feasibility and impact; recommend only the strongest few.",
contrarian_rebel:"State explicitly when consensus is actually right; dissent only with argument or evidence.",
strategic_optimist:"Run a premortem and list the most likely failure causes.",
paranoid_strategist:"Prefer the simplest explanation unless evidence supports intent or coordination.",
hyperfocus_systemizer:"Add an explicit human-factor check.",
associative_leaper:"Finish with one prioritized synthesis tied back to the original question.",
deep_empath:"State the difficult truth explicitly rather than softening it away.",
icy_analyst:"Run an explicit ethical/human-cost check.",
contemplative_dreamer:"Translate every abstract insight into concrete actions.",
bold_adventurer:"Cap irreversible downside before recommending action.",
majestic_confident:"Name ways the recommendation may be wrong and calibrate confidence.",
vigilant_survivor:"State what is fundamentally different this time instead of fighting the last war.",
playful_trickster:"End with a serious concrete recommendation.",
ascetic_minimalist:"State what simplification sacrifices and when added complexity is justified.",
competitive_warrior:"Seek a non-zero-sum option before confrontation.",
traditional_guardian:"State explicit triggers that justify radical change.",
sleepless_ruminator:"Finish with one decision despite residual uncertainty.",
serene_seer:"Convert intuition into a falsifiable hypothesis."
};

export function cognitiveCard(index){
  if(!Number.isInteger(index)||index<0||index>=500)throw new RangeError("expert index must be 0..499");
  const primary=index%30;
  let secondary=(index*7+Math.floor(index/30)+1)%30;
  if(secondary===primary)secondary=(secondary+1)%30;
  const stance=(index*11+Math.floor(index/24))%24;
  const school=(index*3+Math.floor(index/10))%10;
  return {
    version:COGNITIVE_CARD_VERSION,
    source_digest:COGNITIVE_SOURCE_DIGEST,
    primary_power:POWER_KEYS[primary],
    secondary_power:POWER_KEYS[secondary],
    stance:STANCE_KEYS[stance],
    school:SCHOOL_KEYS[school],
    signature:[POWER_KEYS[primary],POWER_KEYS[secondary],STANCE_KEYS[stance],SCHOOL_KEYS[school]].join("|")
  };
}

export function cognitiveRosterReceipt(count=500){
  const cards=Array.from({length:count},(_,i)=>cognitiveCard(i));
  const uniq=a=>new Set(a).size;
  return {
    experts:cards.length,
    unique_signatures:uniq(cards.map(x=>x.signature)),
    primary_power_coverage:uniq(cards.map(x=>x.primary_power)),
    secondary_power_coverage:uniq(cards.map(x=>x.secondary_power)),
    stance_coverage:uniq(cards.map(x=>x.stance)),
    school_coverage:uniq(cards.map(x=>x.school))
  };
}
