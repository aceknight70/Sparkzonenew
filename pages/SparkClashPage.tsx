import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, Character, UserCreation, SparkCard, SparkDeck, SparkBattleProfile } from '../types';
import UserAvatar from '../components/UserAvatar';
import { 
  Zap, 
  Shield, 
  Activity, 
  Heart, 
  Flame, 
  Coins, 
  Sparkles, 
  Plus, 
  Minus, 
  Info, 
  Lock, 
  History, 
  Award, 
  Trash2, 
  Edit3, 
  Play, 
  ArrowLeft, 
  ShoppingBag, 
  Hammer, 
  Dices,
  RefreshCw,
  Sparkle,
  Check,
  Award as Ribbon,
  BookOpen,
  Send,
  AlertTriangle,
  UserX,
  Compass
} from 'lucide-react';

import {
  TemplateAction,
  TemplateRole,
  TemplateTier,
  NewTemplate,
  TIER_DETAILS,
  ELEMENT_ICONS,
  ELEMENT_COLORS,
  filterProfanity,
  staticTemplates,
  getLeagueAndIcon,
  drawGacha,
  listNextTier,
  rollCraftResult
} from './SparkClashHelpers';

interface SparkClashPageProps {
  onExit: () => void;
  currentUser: User;
  userCreations: UserCreation[];
  onUpdateUser: (updates: Partial<User>) => void;
}

type MenuTab = 'Hub' | 'Squad' | 'Shop' | 'Forge' | 'Leaderboard';

// In-battle structures
interface BattleOC {
  id: string; // card id
  ocId: number;
  name: string;
  avatarUrl: string;
  role: TemplateRole;
  tier: TemplateTier;
  maxHp: number;
  hp: number;
  energy: number;
  element: 'Solar' | 'Lunar' | 'Terra' | 'Void';
  actions: TemplateAction[];
  customActionNames?: string[];
  status: {
    poison: number; // turns remaining
    burn: number; // turns remaining
    stun: number; // turns remaining
    taunt: number; // turns remaining
    shield: number; // current shield health
  };
  hasActed: boolean;
}

export const SparkClashPage: React.FC<SparkClashPageProps> = ({
  onExit,
  currentUser,
  userCreations,
  onUpdateUser,
}) => {
  // Ensure we have a profile
  const profile: SparkBattleProfile = useMemo(() => {
    return currentUser.sparkClashProfile || {
      battlePower: 1000,
      sparks: 500,
      wins: 0,
      losses: 0,
      inventory: [],
      templates: [],
      decks: [],
    };
  }, [currentUser.sparkClashProfile]);

  // Transaction history mapping
  const transactions = useMemo(() => {
    // If transactions array doesn't exist, we fallback
    return (profile as any).transactions || [
      { id: '1', date: '2026-06-20', type: 'Welcome Gift', amount: 500, desc: 'Starter fund added by admin' }
    ];
  }, [profile]);

  // Fallback characters if user has none
  const fallbackOcs: Character[] = useMemo(() => {
    return [
      { id: 991, name: 'Kaelen Shadowdancer', imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200', bio: 'Agile space rogue specializing in close-quarters vacuum swordplay.', authorId: 0, type: 'Character', timelineEvents: [], rules: [], likesCount: 0, likes: [], createdAt: '', commentsCount: 0, authorName: '', authorAvatarUrl: '' },
      { id: 992, name: 'Lyra Valerius', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200', bio: 'Solar priestess capable of focusing high-energy flares through ancient gemstones.', authorId: 0, type: 'Character', timelineEvents: [], rules: [], likesCount: 0, likes: [], createdAt: '', commentsCount: 0, authorName: '', authorAvatarUrl: '' },
      { id: 993, name: 'Brontes Earthshield', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200', bio: 'Cybernetic defender with heavy alloy plate shields.', authorId: 0, type: 'Character', timelineEvents: [], rules: [], likesCount: 0, likes: [], createdAt: '', commentsCount: 0, authorName: '', authorAvatarUrl: '' },
      { id: 994, name: 'Seraphina Celestial', imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200', bio: 'Mending beacon that channels the lunar currents to patch biological and robotic failures.', authorId: 0, type: 'Character', timelineEvents: [], rules: [], likesCount: 0, likes: [], createdAt: '', commentsCount: 0, authorName: '', authorAvatarUrl: '' },
      { id: 995, name: 'Xylar Voidspark', imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200', bio: 'Void warrior utilizing anti-matter bursts.', authorId: 0, type: 'Character', timelineEvents: [], rules: [], likesCount: 0, likes: [], createdAt: '', commentsCount: 0, authorName: '', authorAvatarUrl: '' }
    ];
  }, []);

  const availableOcs: Character[] = useMemo(() => {
    const custom = userCreations.filter(c => c.type === 'Character' || c.type === 'AI Character') as Character[];
    return custom.length > 0 ? custom : fallbackOcs;
  }, [userCreations, fallbackOcs]);

  // Tab State
  const [activeTab, setActiveTab] = useState<MenuTab>('Hub');

  // Gacha Visual State
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [revealedTemplate, setRevealedTemplate] = useState<NewTemplate | null>(null);

  // Card Naming customizer state
  const [customizingCardId, setCustomizingCardId] = useState<string | null>(null);
  const [custCardName, setCustCardName] = useState('');
  const [custActionNames, setCustActionNames] = useState<string[]>(['', '', '']);

  // Crafting state (Combine 3 of same tier)
  const [craftingBlankIds, setCraftingBlankIds] = useState<string[]>([]);
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftedResult, setCraftedResult] = useState<NewTemplate | null>(null);

  // Shop refresh / rotation state
  const [shopTemplates, setShopTemplates] = useState<NewTemplate[]>([]);
  useEffect(() => {
    // Generate 5 daily rotating templates
    const shuffled = [...staticTemplates].sort(() => 0.5 - Math.random());
    setShopTemplates(shuffled.slice(0, 5));
  }, []);

  // Sync profile edits to cloud/Firestore
  const saveProfileUpdates = async (newProfile: SparkBattleProfile) => {
    onUpdateUser({ sparkClashProfile: newProfile });
    try {
      if (currentUser && currentUser.id) {
        const docRef = doc(db, 'users', currentUser.id.toString());
        await setDoc(docRef, { sparkClashProfile: newProfile }, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to save profile to Firestore:', e);
    }
  };

  const addTransaction = (profileState: SparkBattleProfile, type: string, amount: number, desc: string): SparkBattleProfile => {
    const newTx = {
      id: `tx_${Date.now()}_` + Math.floor(Math.random() * 100),
      date: new Date().toISOString().split('T')[0],
      type,
      amount,
      desc
    };
    const tList = (profileState as any).transactions || [];
    return {
      ...profileState,
      transactions: [newTx, ...tList].slice(0, 50)
    } as any;
  };

  // -------------------------------------------------------------
  // SOULBIND (Attach template to OC in Forge)
  // -------------------------------------------------------------
  const [soulbindTemplateId, setSoulbindTemplateId] = useState<string | null>(null);
  const [soulbindOcId, setSoulbindOcId] = useState<number | null>(null);

  const handleSoulbind = () => {
    if (!soulbindTemplateId || !soulbindOcId) return;
    const templateIdx = profile.templates.indexOf(soulbindTemplateId);
    if (templateIdx === -1) return;

    const baseTemp = staticTemplates.find(t => t.id === soulbindTemplateId);
    if (!baseTemp) return;

    const matchedOc = availableOcs.find(o => o.id === soulbindOcId);
    const ocName = matchedOc ? matchedOc.name : 'Unknown';

    // Create a forged SparkCard
    const newCard: SparkCard = {
      id: `card_${Date.now()}_` + Math.floor(Math.random() * 100),
      templateId: soulbindTemplateId,
      ownerId: currentUser.id as any,
      characterId: soulbindOcId,
      customName: `${ocName}'s ${baseTemp.role}`,
    };
    (newCard as any).customActionNames = baseTemp.actions.map(a => a.name);

    // Update Profile
    const templatesCopy = [...profile.templates];
    templatesCopy.splice(templateIdx, 1);

    const updated = {
      ...profile,
      inventory: [...profile.inventory, newCard],
      templates: templatesCopy
    };

    saveProfileUpdates(updated);
    setSoulbindTemplateId(null);
    setSoulbindOcId(null);
    alert(`Successfully Soulbound! "${newCard.customName}" added to inventory.`);
  };

  // -------------------------------------------------------------
  // CUSTOM MOVESET RENAMING
  // -------------------------------------------------------------
  const startCustomizing = (card: SparkCard) => {
    const sourceTemp = staticTemplates.find(t => t.id === card.templateId);
    if (!sourceTemp) return;
    setCustomizingCardId(card.id);
    setCustCardName(card.customName || sourceTemp.name);
    setCustActionNames((card as any).customActionNames || sourceTemp.actions.map(a => a.name));
  };

  const saveCustomNames = () => {
    if (!customizingCardId) return;

    const updatedInventory = profile.inventory.map(c => {
      if (c.id === customizingCardId) {
        return {
          ...c,
          customName: filterProfanity(custCardName),
          customActionNames: custActionNames.map(name => filterProfanity(name))
        };
      }
      return c;
    });

    const updated = {
      ...profile,
      inventory: updatedInventory
    };

    saveProfileUpdates(updated);
    setCustomizingCardId(null);
  };

  // -------------------------------------------------------------
  // MULTIPLE COMBINE OF BLANK TEMPLATES (Crafting)
  // -------------------------------------------------------------
  const toggleCraftSelect = (id: string) => {
    if (craftingBlankIds.includes(id)) {
      setCraftingBlankIds(prev => prev.filter(x => x !== id));
    } else {
      if (craftingBlankIds.length >= 3) return;
      setCraftingBlankIds(prev => [...prev, id]);
    }
  };

  const handleCraftTemplates = () => {
    if (craftingBlankIds.length !== 3) return;
    const t0 = craftingBlankIds[0];
    const t1 = craftingBlankIds[1];
    const t2 = craftingBlankIds[2];

    const temp0 = staticTemplates.find(t => t.id === t0);
    const temp1 = staticTemplates.find(t => t.id === t1);
    const temp2 = staticTemplates.find(t => t.id === t2);

    if (!temp0 || !temp1 || !temp2) return;
    if (temp0.tier !== temp1.tier || temp0.tier !== temp2.tier) {
      alert("All 3 templates must be of the EXACT SAME TIER to combine!");
      return;
    }

    const nextTier = listNextTier(temp0.tier);
    if (!nextTier) {
      alert("Cosmic is the absolute ultimate tier! You cannot combine Cosmic templates any further.");
      return;
    }

    setIsCrafting(true);
    setCraftedResult(null);

    setTimeout(() => {
      const outcome = rollCraftResult(nextTier);
      // Remove used 3 templates from blank profile list, add new outcome
      const templatesCopy = [...profile.templates];
      [t0, t1, t2].forEach(id => {
        const pos = templatesCopy.indexOf(id);
        if (pos !== -1) templatesCopy.splice(pos, 1);
      });
      templatesCopy.push(outcome.id);

      const baseUpdated = {
        ...profile,
        templates: templatesCopy
      };
      const finalUpdated = addTransaction(baseUpdated, 'Crafting Combine', 0, `Fused 3x ${temp0.tier} into 1x ${nextTier} Blank`);

      saveProfileUpdates(finalUpdated);
      setCraftedResult(outcome);
      setIsCrafting(false);
      setCraftingBlankIds([]);
    }, 2000);
  };

  // -------------------------------------------------------------
  // SQUAD BUILD (Deck = exactly 7 Slots: 5 Active, 2 Bench)
  // -------------------------------------------------------------
  const squadDeck: SparkDeck | null = useMemo(() => {
    // We look for a deck or construct a default one which has exactly 7 OCs cardIds
    return profile.decks[0] || { id: 'squad_default', name: 'Active Combat Squad', cardIds: [] };
  }, [profile.decks]);

  const handleAssignToSquad = (cardId: string, slotIndex: number) => {
    const list = [...(squadDeck?.cardIds || [])];

    // Check if duplicate instance
    if (list.includes(cardId)) {
      // swap the existing slot if it had it
      const currentIdx = list.indexOf(cardId);
      list[currentIdx] = '';
    }

    list[slotIndex] = cardId;

    // Save
    const defaultDeck: SparkDeck = { id: 'squad_default', name: 'Active Combat Squad', cardIds: list };
    const updated = {
      ...profile,
      decks: [defaultDeck]
    };
    saveProfileUpdates(updated);
  };

  const handleUnassignSlot = (slotIndex: number) => {
    const list = [...(squadDeck?.cardIds || [])];
    list[slotIndex] = '';
    const defaultDeck: SparkDeck = { id: 'squad_default', name: 'Active Combat Squad', cardIds: list };
    const updated = {
      ...profile,
      decks: [defaultDeck]
    };
    saveProfileUpdates(updated);
  };

  // -------------------------------------------------------------
  // SPARK MARKET BUY ROTATING TEMPLATE
  // -------------------------------------------------------------
  const handleBuyTemplate = (template: NewTemplate) => {
    const price = TIER_DETAILS[template.tier].price;
    if (profile.sparks < price) {
      alert("Insufficient Sparks! Win battles, claim daily supply or buy coin bundles.");
      return;
    }

    const baseUpdated = {
      ...profile,
      sparks: profile.sparks - price,
      templates: [...profile.templates, template.id]
    };
    const finalUpdated = addTransaction(baseUpdated, 'Market Purchase', -price, `Acquired Blank Template: ${template.name}`);

    saveProfileUpdates(finalUpdated);
    alert(`Purchased 1x Blank [${template.name}]! Attach it inside the Forge.`);
  };

  const handleRefreshMarket = () => {
    if (profile.sparks < 20) {
      alert("Refreshing costs 20 Sparks!");
      return;
    }
    const shuffled = [...staticTemplates].sort(() => 0.5 - Math.random());
    setShopTemplates(shuffled.slice(0, 5));

    const baseUpdated = {
      ...profile,
      sparks: profile.sparks - 20
    };
    const finalUpdated = addTransaction(baseUpdated, 'Market Refresh', -20, 'Rotated daily templates selection manually');
    saveProfileUpdates(finalUpdated);
  };

  // -------------------------------------------------------------
  // CELESTIAL GACHA PACK OPENING SIMULATOR
  // -------------------------------------------------------------
  const handleBuyGacha = (packType: 'Spark' | 'Relic' | 'Legendary' | 'Cosmic') => {
    const price = packType === 'Spark' ? 50 : packType === 'Relic' ? 200 : packType === 'Legendary' ? 500 : 1000;
    if (profile.sparks < price) {
      alert("Insufficient Sparks for this card pack!");
      return;
    }

    setIsOpeningPack(true);
    setRevealedTemplate(null);

    setTimeout(() => {
      const drawn = drawGacha(packType);
      const baseUpdated = {
        ...profile,
        sparks: profile.sparks - price,
        templates: [...profile.templates, drawn.id]
      };
      const finalUpdated = addTransaction(baseUpdated, 'Pack Purchased', -price, `Opened Gacha ${packType} Pack: Drew ${drawn.name}`);

      saveProfileUpdates(finalUpdated);
      setRevealedTemplate(drawn);
      setIsOpeningPack(false);
    }, 1800);
  };

  // Clean helper to calculate HP of card
  const calculateCardHP = (tid: string, role: TemplateRole): number => {
    const details = staticTemplates.find(t => t.id === tid);
    if (!details) return 50;
    const base = TIER_DETAILS[details.tier].baseHp;
    const mult = role === 'Tank' ? 1.3 : role === 'Healer' ? 0.9 : 1.0;
    return Math.round(base * mult);
  };

  // Daily supply free claim
  const [claimedDaily, setClaimedDaily] = useState(false);
  const claimDailySparks = () => {
    const baseUpdated = { ...profile, sparks: profile.sparks + 150 };
    const final = addTransaction(baseUpdated, 'Free Daily Supply', 150, 'Claimed daily virtual fund');
    saveProfileUpdates(final);
    setClaimedDaily(true);
  };

  // Buy virtual spark bundles (Simulator)
  const buySparkBundleSimulator = (usd: number, sparkQty: number) => {
    if (confirm(`Authorize sandbox microtransaction for $${usd}? Virtual Sparks will be added immediately.`)) {
      const baseUpdated = { ...profile, sparks: profile.sparks + sparkQty };
      const final = addTransaction(baseUpdated, 'Coin Purchase', sparkQty, `Bought $${usd} virtual spark currency pack`);
      saveProfileUpdates(final);
      alert(`Successfully funded +${sparkQty} Sparks! Enjoy the Gacha and Market.`);
    }
  };

  // -------------------------------------------------------------
  // BATTLEFLOW GAMEPLAY SIMULATOR
  // -------------------------------------------------------------
  const [battleState, setBattleState] = useState<'lobby' | 'queuing' | 'preview' | 'playing' | 'post'>('lobby');
  const [matchOpponent, setMatchOpponent] = useState<any>(null);
  const [matchLoadingProg, setMatchLoadingProg] = useState(0);
  const [coinTossResult, setCoinTossResult] = useState<string | null>(null);

  // Turn tracking
  const [battleTurn, setBattleTurn] = useState<'Player' | 'Opponent'>('Player');
  const [turnCount, setTurnCount] = useState(1);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [playerSquad, setPlayerSquad] = useState<BattleOC[]>([]);
  const [opponentSquad, setOpponentSquad] = useState<BattleOC[]>([]);
  const [selectedActOCIndex, setSelectedActOCIndex] = useState<number | null>(null);
  const [activeSubstUsed, setActiveSubstUsed] = useState(false);

  // Targeting overlay states
  const [castingActionIdx, setCastingActionIdx] = useState<number | null>(null);
  const [validTargetGroup, setValidTargetGroup] = useState<'friendly' | 'enemy' | 'all-friendly' | 'all-enemy' | 'front-row' | 'back-row' | 'self' | null>(null);

  const [aiReport, setAiReport] = useState<string | null>(null);

  // Matchmaking triggers
  const startMatchmaking = (isRanked: boolean) => {
    // Verify player has exactly 7 squad slots assigned
    const cardIds = squadDeck?.cardIds || [];
    const actualCards = cardIds.filter(id => id && profile.inventory.some(c => c.id === id));
    if (actualCards.length < 7) {
      alert("You MUST construct your squad with exactly 7 assigned OCs (5 Active, 2 Bench) on the Squad tab to start the battle!");
      return;
    }

    setBattleState('queuing');
    setMatchLoadingProg(0);

    const progTimer = setInterval(() => {
      setMatchLoadingProg(p => {
        if (p >= 100) {
          clearInterval(progTimer);
          // Pick rival
          const rivals = [
            { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200', elo: 2400, rankTxt: 'Grandmaster' },
            { name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200', elo: 800, rankTxt: 'Gladiator' },
            { name: 'Elara Vane', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200', elo: 3100, rankTxt: 'Cosmic Overlord' },
            { name: 'Darius Black', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200', elo: 1800, rankTxt: 'Duelist' }
          ];
          const chosen = rivals[Math.floor(Math.random() * rivals.length)];
          setMatchOpponent(chosen);
          setBattleState('preview');
          setTurnCount(1);
          setBattleLogs(['Match Opponent Found! Core Team Preview.']);
          // Simulate loading player & enemy actual Battle OCs
          initBattleSquads(cardIds);
          return 100;
        }
        return p + 25;
      });
    }, 400);
  };

  const initBattleSquads = (playerDeckCardIds: string[]) => {
    // Map player deck
    const playerMapped: BattleOC[] = playerDeckCardIds.map((cid, index) => {
      const invCard = profile.inventory.find(i => i.id === cid);
      if (!invCard) return null as any;
      const staticT = staticTemplates.find(t => t.id === invCard.templateId);
      if (!staticT) return null as any;
      const oc = availableOcs.find(o => o.id === invCard.characterId) || fallbackOcs[0];

      return {
        id: invCard.id,
        ocId: oc.id,
        name: oc.name,
        avatarUrl: oc.imageUrl,
        role: staticT.role,
        tier: staticT.tier,
        maxHp: calculateCardHP(invCard.templateId, staticT.role),
        hp: calculateCardHP(invCard.templateId, staticT.role),
        energy: 3, // Start with 3 persistence energy
        element: staticT.element,
        actions: staticT.actions,
        customActionNames: (invCard as any).customActionNames || staticT.actions.map(a => a.name),
        status: { poison: 0, burn: 0, stun: 0, taunt: 0, shield: 0 },
        hasActed: false
      };
    }).filter(Boolean);

    setPlayerSquad(playerMapped);

    // Map enemy squad (static but exciting based on level)
    const enemyTemplates = [...staticTemplates].sort(() => 0.5 - Math.random());
    const enemyOcs = [...fallbackOcs].sort(() => 0.5 - Math.random());
    const opponentMapped: BattleOC[] = Array.from({ length: 7 }).map((_, index) => {
      const st = enemyTemplates[index % enemyTemplates.length];
      const oc = enemyOcs[index % enemyOcs.length];
      
      return {
        id: `opp_card_${index}`,
        ocId: oc.id,
        name: `Rival ${oc.name.split(' ')[0]}`,
        avatarUrl: oc.imageUrl,
        role: st.role,
        tier: st.tier,
        maxHp: calculateCardHP(st.id, st.role),
        hp: calculateCardHP(st.id, st.role),
        energy: 3,
        element: st.element,
        actions: st.actions,
        customActionNames: st.actions.map(a => a.name),
        status: { poison: 0, burn: 0, stun: 0, taunt: 0, shield: 0 },
        hasActed: false
      };
    });

    setOpponentSquad(opponentMapped);
  };

  const handleStartBattleArena = () => {
    // 10s Preview skips to playing
    const heads = Math.random() > 0.5;
    setCoinTossResult(heads ? 'HEADS! You Go First.' : 'TAILS! Opponent Goes First.');
    setBattleState('playing');
    setBattleLogs(prev => [`Coin Toss decided! ${heads ? 'You go first!' : 'Opponent acts first.'}`, ...prev]);
    setBattleTurn(heads ? 'Player' : 'Opponent');

    if (!heads) {
      // Run quick opponent start turn cycle
      executeOpponentAI();
    }
  };

  // Helper elements logic
  const checkFrontRowAlive = (squad: BattleOC[]): boolean => {
    // Positions 0 and 1 are front row
    const slot0Alive = squad[0] && squad[0].hp > 0;
    const slot1Alive = squad[1] && squad[1].hp > 0;
    return slot0Alive || slot1Alive;
  };

  // -------------------------------------------------------------
  // GAMEPLAY SKILL CAST TRIGGERS
  // -------------------------------------------------------------
  const prepareCastAction = (actionIdx: number) => {
    if (battleTurn !== 'Player') return;
    if (selectedActOCIndex === null) return;
    const actor = playerSquad[selectedActOCIndex];
    if (actor.hasActed) return;
    const action = actor.actions[actionIdx];
    if (actor.energy < action.energyCost) {
      alert("Not enough Energy on this OC to cast!");
      return;
    }

    setCastingActionIdx(actionIdx);

    // Filter valid slots
    const targetSet = action.targeting;
    if (targetSet === 'Self') {
      setValidTargetGroup('self');
    } else if (targetSet === 'Single ally') {
      setValidTargetGroup('friendly');
    } else if (targetSet === 'All allies') {
      setValidTargetGroup('all-friendly');
    } else if (targetSet === 'Single enemy') {
      setValidTargetGroup('enemy');
    } else if (targetSet === 'All enemies') {
      setValidTargetGroup('all-enemy');
    } else if (targetSet === 'Front row') {
      setValidTargetGroup('front-row');
    } else if (targetSet === 'Back row') {
      setValidTargetGroup('back-row');
    }
  };

  const getAdvantageMultiplier = (att: string, def: string): number => {
    if (att === 'Void') return 1.5;
    if (def === 'Void') return 0.75;
    if (att === 'Solar' && def === 'Terra') return 1.5;
    if (att === 'Terra' && def === 'Lunar') return 1.5;
    if (att === 'Lunar' && def === 'Solar') return 1.5;
    if (att === def) return 1.0;
    return 0.75;
  };

  const castActionOnTarget = (targetIndex: number, isOpponentSide: boolean) => {
    if (selectedActOCIndex === null || castingActionIdx === null) return;

    const actor = playerSquad[selectedActOCIndex];
    const action = actor.actions[castingActionIdx];
    const customActName = actor.customActionNames ? actor.customActionNames[castingActionIdx] : action.name;

    // Deduct energy & mark acted
    const newPlayerSquad = [...playerSquad];
    newPlayerSquad[selectedActOCIndex] = {
      ...actor,
      energy: actor.energy - action.energyCost,
      hasActed: true
    };

    setPlayerSquad(newPlayerSquad);

    const logs: string[] = [];
    logs.push(`⭐ [Turn ${turnCount}] ${actor.name} casts "${customActName}"!`);

    // Resolve target mapping
    let finalOppSquad = [...opponentSquad];
    let finalPlaySquad = [...newPlayerSquad];

    const isBurnModified = actor.status.burn > 0 ? 0.8 : 1.0; // Burn attack reduction

    // Helper process single enemy resolve
    const applySingleCombat = (index: number) => {
      const victim = finalOppSquad[index];
      if (!victim || victim.hp <= 0) return;

      if (action.effectType === 'Damage') {
        const mult = getAdvantageMultiplier(actor.element, victim.element);
        const raw = action.magnitude;
        let finalDmg = Math.round(raw * mult * isBurnModified);

        // Account for shield
        let remDmg = finalDmg;
        if (victim.status.shield > 0) {
          const block = Math.min(victim.status.shield, finalDmg);
          victim.status.shield -= block;
          remDmg -= block;
          logs.push(`🛡️ Blocked ${block} hit on Shield.`);
        }

        victim.hp = Math.max(0, victim.hp - remDmg);
        logs.push(`💥 Hit ${victim.name} for ${finalDmg} damage! ${mult > 1.2 ? '(SUPER EFFECTIVE!)' : mult < 0.9 ? '(Weak resistance...)' : ''}`);
      } else if (action.effectType === 'Debuff') {
        victim.status.burn = action.duration; // Burn attack debuff duration set
        logs.push(`📉 Demoralized and applied Burn debuff to ${victim.name}.`);
      } else if (action.effectType === 'Status') {
        if (action.statusType === 'Poison') {
          victim.status.poison = action.duration;
          logs.push(`💀 Poisoned ${victim.name} for ${action.duration} turns.`);
        } else if (action.statusType === 'Burn') {
          victim.status.burn = action.duration;
          logs.push(`🔥 Burned ${victim.name} for ${action.duration} turns.`);
        } else if (action.statusType === 'Stun') {
          victim.status.stun = action.duration;
          logs.push(`⚡ Stunned ${victim.name}! They skip their next turn.`);
        } else if (action.statusType === 'Taunt') {
          victim.status.taunt = action.duration;
          logs.push(`🛡️ ${victim.name} receives Taunt status forcing opponent targeting.`);
        }
      }
    };

    // Helper process single ally resolve
    const applySingleAlly = (index: number) => {
      const ally = finalPlaySquad[index];
      if (!ally || ally.hp <= 0) return;

      if (action.effectType === 'Heal') {
        ally.hp = Math.min(ally.maxHp, ally.hp + action.magnitude);
        logs.push(`💚 Restored +${action.magnitude} HP to ${ally.name}.`);
      } else if (action.effectType === 'Shield') {
        ally.status.shield += action.magnitude;
        logs.push(`🛡️ Guarded ${ally.name} with +${action.magnitude} Shield.`);
      } else if (action.effectType === 'Buff') {
        logs.push(`💪 Empowered ${ally.name}'s combat multiplier for ${action.duration} turns.`);
      }
    };

    // Process targets
    if (isOpponentSide) {
      if (validTargetGroup === 'enemy') {
        // Enforce Taunt checking
        const activeTaunterIdx = opponentSquad.findIndex(v => v.hp > 0 && v.status.taunt > 0);
        const finalTargetIdx = (activeTaunterIdx !== -1 && activeTaunterIdx < 5) ? activeTaunterIdx : targetIndex;
        applySingleCombat(finalTargetIdx);
      } else if (validTargetGroup === 'all-enemy') {
        for (let i = 0; i < 5; i++) {
          applySingleCombat(i);
        }
      } else if (validTargetGroup === 'front-row') {
        applySingleCombat(0);
        applySingleCombat(1);
      } else if (validTargetGroup === 'back-row') {
        applySingleCombat(2);
        applySingleCombat(3);
        applySingleCombat(4);
      }
    } else {
      // Friendly side
      if (validTargetGroup === 'self' || validTargetGroup === 'friendly') {
        applySingleAlly(targetIndex);
      } else if (validTargetGroup === 'all-friendly') {
        for (let i = 0; i < 5; i++) {
          applySingleAlly(i);
        }
      }
    }

    setOpponentSquad(finalOppSquad);
    setPlayerSquad(finalPlaySquad);

    // Log & Cleanup
    setBattleLogs(prev => [...logs.map(l => `⚔️ ${l}`), ...prev]);
    setCastingActionIdx(null);
    setValidTargetGroup(null);
    setSelectedActOCIndex(null);

    // Auto verify results
    checkEndBattleConditions(finalPlaySquad, finalOppSquad);
  };

  // -------------------------------------------------------------
  // SUBSTITUTE IN COMBAT CONTROL
  // -------------------------------------------------------------
  const executeSubstitution = (activeSlotIdx: number, benchedSlotIdx: number) => {
    if (activeSubstUsed) {
      alert("You can only perform one substitution per turn!");
      return;
    }
    const incoming = playerSquad[benchedSlotIdx];
    if (incoming.hp <= 0) {
      alert("Defeated OCs are deep in critical recovery and cannot be swapped in!");
      return;
    }

    const playCopy = [...playerSquad];
    const originalActive = playCopy[activeSlotIdx];

    // incoming loses 1 energy immediately
    incoming.energy = Math.max(0, incoming.energy - 1);

    // swap index positions in our state array mapping
    playCopy[activeSlotIdx] = incoming;
    playCopy[benchedSlotIdx] = originalActive;

    setPlayerSquad(playCopy);
    setActiveSubstUsed(true);
    setBattleLogs(prev => [`🔄 Substituted Active #${activeSlotIdx + 1} (${originalActive ? originalActive.name : 'Empty'}) with Bench (${incoming.name}). Costed 1 energy.`, ...prev]);
  };

  const handleEndPlayerTurn = () => {
    // Shift turn
    setBattleTurn('Opponent');
    setBattleLogs(prev => ['▶️ Opponent (AI) Turn Initiated.', ...prev]);

    // Opponent logic triggers
    setTimeout(() => {
      executeOpponentAI();
    }, 1200);
  };

  // -------------------------------------------------------------
  // OPPONENT AI TACTIC SIMULATOR
  // -------------------------------------------------------------
  const executeOpponentAI = () => {
    let playCopy = [...playerSquad];
    let oppCopy = [...opponentSquad];
    const logs: string[] = [];

    // All active squad members gain +1 energy on turn boundary
    oppCopy = oppCopy.map((oc, i) => {
      if (i < 5 && oc.hp > 0) {
        return { ...oc, energy: Math.min(10, oc.energy + 1) };
      }
      return oc;
    });

    // Run active opponent OCs sequence
    oppCopy.forEach((actor, actorIdx) => {
      if (actorIdx >= 5 || actor.hp <= 0 || actor.status.stun > 0) {
        if (actor.status.stun > 0 && actorIdx < 5) {
          actor.status.stun = Math.max(0, actor.status.stun - 1);
          logs.push(`⚡ ${actor.name} is Stunned and skips action.`);
        }
        return;
      }

      // Check affordable actions
      const viable = actor.actions.map((act, idx) => ({ act, idx })).filter(f => actor.energy >= f.act.energyCost);
      if (viable.length === 0) return;

      // Pick random skill action
      const chosen = viable[Math.floor(Math.random() * viable.length)];
      const skill = chosen.act;
      actor.energy -= skill.energyCost;

      // Select target
      if (skill.targeting === 'Self' || skill.targeting === 'Single ally' || skill.targeting === 'All allies') {
        const allyIdx = Math.floor(Math.random() * 5); // opponent friendly list [0-4]
        const target = oppCopy[allyIdx];
        if (target && target.hp > 0) {
          if (skill.effectType === 'Heal') {
            target.hp = Math.min(target.maxHp, target.hp + skill.magnitude);
            logs.push(`💖 [AI] ${actor.name} casted "${skill.name}" healing ${target.name} for +${skill.magnitude} HP.`);
          } else if (skill.effectType === 'Shield') {
            target.status.shield += skill.magnitude;
            logs.push(`🛡️ [AI] ${actor.name} shields ${target.name} with barrier (+${skill.magnitude}).`);
          } else {
            logs.push(`✨ [AI] ${actor.name} applied positive support buffs to ${target.name}.`);
          }
        }
      } else {
        // Attack player (respecting front-row block rule!)
        const isPlayerFrontAlive = checkFrontRowAlive(playCopy);
        let validTargets: number[] = [];
        if (skill.targeting === 'Back row') {
          validTargets = [2, 3, 4];
        } else if (isPlayerFrontAlive) {
          validTargets = [0, 1].filter(idx => playCopy[idx] && playCopy[idx].hp > 0);
          if (validTargets.length === 0) validTargets = [2, 3, 4];
        } else {
          validTargets = [0, 1, 2, 3, 4].filter(idx => playCopy[idx] && playCopy[idx].hp > 0);
        }

        // Apply Taunt intercept on player side
        const playTaunterIdx = playCopy.findIndex(v => v.hp > 0 && v.status.taunt > 0);
        const finalTIdx = (playTaunterIdx !== -1 && playTaunterIdx < 5) ? playTaunterIdx : (validTargets[Math.floor(Math.random() * validTargets.length)] || 0);

        const target = playCopy[finalTIdx];
        if (target && target.hp > 0) {
          if (skill.effectType === 'Damage') {
            const mult = getAdvantageMultiplier(actor.element, target.element);
            let dmg = Math.round(skill.magnitude * mult);

            let remDmg = dmg;
            if (target.status.shield > 0) {
              const blk = Math.min(target.status.shield, remDmg);
              target.status.shield -= blk;
              remDmg -= blk;
            }

            target.hp = Math.max(0, target.hp - remDmg);
            logs.push(`💥 [AI] ${actor.name} hit your ${target.name} for ${dmg} damage!`);
          } else if (skill.effectType === 'Debuff') {
            target.status.burn = skill.duration;
            logs.push(`📉 [AI] ${actor.name} demoralized your team and ignited ${target.name}.`);
          } else {
            target.status.poison = skill.duration;
            logs.push(`💀 [AI] ${actor.name} corrupted ${target.name} with terminal poison over time.`);
          }
        }
      }
    });

    // Resolve Turn boundaries (DOTs, cool offs) for both sides
    const applyTurnEndMending = (squad: BattleOC[], logsArr: string[], who: 'Player' | 'AI') => {
      squad.forEach((oc, i) => {
        if (i < 5 && oc.hp > 0) {
          if (oc.status.poison > 0) {
            oc.hp = Math.max(0, oc.hp - 5);
            logsArr.push(`💀 Poison ticking: ${oc.name} loses 5 HP.`);
            oc.status.poison = Math.max(0, oc.status.poison - 1);
          }
          if (oc.status.burn > 0) {
            oc.hp = Math.max(0, oc.hp - 3);
            logsArr.push(`🔥 Burn ticking: ${oc.name} loses 3 HP.`);
            oc.status.burn = Math.max(0, oc.status.burn - 1);
          }
          oc.status.taunt = Math.max(0, oc.status.taunt - 1);
        }
      });
    };

    applyTurnEndMending(oppCopy, logs, 'AI');

    // Setup player next turn
    playCopy = playCopy.map((oc, i) => {
      if (i < 5 && oc.hp > 0) {
        return {
          ...oc,
          energy: Math.min(10, oc.energy + 1), // gain +1 energy
          hasActed: false
        };
      }
      return oc;
    });

    applyTurnEndMending(playCopy, logs, 'Player');

    // Update States
    setPlayerSquad(playCopy);
    setOpponentSquad(oppCopy);
    setTurnCount(prev => prev + 1);
    setActiveSubstUsed(false);
    setSelectedActOCIndex(null);
    setCastingActionIdx(null);
    setValidTargetGroup(null);

    setBattleLogs(prev => [...logs.map(l => `🤖 ${l}`), '◀️ Your turn. All OCs gained +1 Energy.', ...prev]);
    setBattleTurn('Player');

    checkEndBattleConditions(playCopy, oppCopy);
  };

  const checkEndBattleConditions = (pSquad: BattleOC[], oSquad: BattleOC[]) => {
    // 5 active on player side
    const pAlive = pSquad.slice(0, 5).some(o => o && o.hp > 0);
    // 5 active on enemy side
    const oAlive = oSquad.slice(0, 5).some(o => o && o.hp > 0);

    if (!pAlive) {
      handleMatchResult(false);
    } else if (!oAlive) {
      handleMatchResult(true);
    }
  };

  const handleMatchResult = (win: boolean) => {
    setBattleState('post');

    // Give rewards
    const sparkEarned = win ? Math.floor(Math.random() * 41) + 10 : 5; // 10-50 for win, 5 for loss
    const isBlankDropping = win && Math.random() < 0.10; // 10% blank drop
    const droppedTemplate = isBlankDropping ? staticTemplates[Math.floor(Math.random() * staticTemplates.length)] : null;
    const bpChange = win ? 50 : -20;

    const baseUpdated = {
      ...profile,
      battlePower: Math.max(0, profile.battlePower + bpChange),
      sparks: profile.sparks + sparkEarned,
      wins: win ? profile.wins + 1 : profile.wins,
      losses: win ? profile.losses : profile.losses + 1,
      templates: droppedTemplate ? [...profile.templates, droppedTemplate.id] : profile.templates
    };

    const final = addTransaction(
      baseUpdated,
      win ? 'Battle WIN' : 'Battle DEFEAT',
      sparkEarned,
      `Finished match against ${matchOpponent ? matchOpponent.name : 'Rival'}. ELO updated by ${bpChange}.`
    );

    saveProfileUpdates(final);

    setAiReport(null);
    // Generate simulated AI advisor breakdown
    setTimeout(() => {
      // Create detailed suggestions report
      const reasons = win ? [
        "Your frontline Tank absorbed standard physical impacts safely, utilizing Element void offsets against Solar-lunar weaknesses.",
        "Your substitution timed well inside turn blocks prevents low energy starvation on primary heavy hitting OCs.",
        "Consider moving a Healer with Shield outputs to Back Row pos 4 for ultra safety locks against back row piercing."
      ] : [
        "Front row block was breached too quickly. Try putting your highest HP Role Tank (e.g. Sentinel) in pos 1 or 2 with Shield skills.",
        "Your energy reserves fell too low without standard recovery. Combine moves renaming with lower cost slots (e.g. 1-2 cost moves).",
        "The element Solars were countered by opposing Lunar. Forge more varied templates in the Forge!"
      ];
      setAiReport(`🔥 Spark Clash Tactical Assessment (OC-Synergy Core Analyzer)\n\nMVP OC: ${pSquad[0]?.name || 'Your Agent'}\n\nKey Insights:\n1. ${reasons[0]}\n2. ${reasons[1]}\n3. ${reasons[2]}\n\nRecommendation: Fusing templates down in Forge tab generates massive Relic and Epic tiers blanks to increase base stat ceilings!`);
    }, 1500);
  };

  // -------------------------------------------------------------
  // RENDERING HELPERS
  // -------------------------------------------------------------
  const renderLeagueBadge = (bp: number) => {
    const info = getLeagueAndIcon(bp);
    return (
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-700/60 px-4 py-2 rounded-xl">
        <span className="text-3xl">{info.icon}</span>
        <div className="flex flex-col text-left">
          <span className={`font-mono text-sm uppercase tracking-wider font-extrabold ${info.color}`}>{info.league}</span>
          <span className="text-gray-400 text-xs">Rating (ELO): <b className="text-white">{bp}</b></span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#050505] text-gray-100 font-sans overflow-hidden">
      {/* Header bar */}
      <header className="h-14 flex-shrink-0 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="font-extrabold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-yellow-400 text-lg">
            SPARK CLASH PRO
          </div>
        </div>

        {/* Global Currency Display */}
        <div className="flex items-center gap-3 bg-[#0d0d11] px-3 py-1.5 rounded-full border border-yellow-500/30">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-black text-yellow-300">{profile.sparks}</span>
          <span className="text-[10px] text-gray-500 uppercase font-mono">Sparks</span>
        </div>
      </header>

      {battleState !== 'lobby' ? (
        // -------------------------------------------------------------
        // BATTLE ARENA MAIN VIEWPORT
        // -------------------------------------------------------------
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
          {/* QUEUING SCREEN OVERLAY */}
          {battleState === 'queuing' && (
            <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center">
              <Compass className="w-16 h-16 text-red-500 animate-spin mb-4" />
              <h2 className="text-2xl font-black tracking-widest text-white uppercase">Searching for Opponents...</h2>
              <p className="text-gray-400 text-sm mt-1 max-w-sm">Comparing ELO league ranges and matching live custom creations.</p>
              
              <div className="w-64 bg-gray-800 h-2 rounded-full overflow-hidden mt-6">
                <div className="bg-gradient-to-r from-red-500 to-yellow-500 h-full transition-all duration-300" style={{ width: `${matchLoadingProg}%` }}></div>
              </div>
            </div>
          )}

          {/* TEAM PREVIEW TIMER OVERLAY */}
          {battleState === 'preview' && (
            <div className="absolute inset-0 bg-black/95 z-50 flex flex-col p-6 items-center overflow-y-auto">
              <div className="text-center max-w-lg">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400 uppercase">10-Second Team Preview</h2>
                <p className="text-gray-400 text-xs mt-1">Both tactical competitors inspect the roster setup. Swap active vs. bench slots before battle commences.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-6">
                {/* Player side preview */}
                <div className="bg-gray-905 border border-gray-800/80 p-4 rounded-xl text-center">
                  <h3 className="text-green-400 font-bold tracking-wider mb-2 uppercase">Your Active Squad</h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {playerSquad.slice(0, 5).map((oc, i) => (
                      <div key={i} className="flex flex-col items-center p-2 bg-gray-900 rounded border border-gray-800 w-24">
                        <img src={oc?.avatarUrl} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                        <span className="text-[10px] text-white truncate w-full font-bold mt-1 text-center">{oc?.name}</span>
                        <span className="text-[9px] text-gray-500">{oc?.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enemy side preview */}
                <div className="bg-gray-905 border border-gray-800/80 p-4 rounded-xl text-center">
                  <h3 className="text-red-400 font-bold tracking-wider mb-2 uppercase">Opponent: {matchOpponent?.name}</h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {opponentSquad.slice(0, 5).map((oc, i) => (
                      <div key={i} className="flex flex-col items-center p-2 bg-gray-900 rounded border border-gray-800 w-24">
                        <img src={oc?.avatarUrl} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                        <span className="text-[10px] text-white truncate w-full font-bold mt-1 text-center">{oc?.name}</span>
                        <span className="text-[9px] text-gray-500">{oc?.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleStartBattleArena}
                className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all text-sm uppercase tracking-wider"
              >
                Skip Preview & Toss Coin
              </button>
            </div>
          )}

          {/* POST BATTLE OUTCOME SCREEN */}
          {battleState === 'post' && (
            <div className="absolute inset-0 bg-black/95 z-50 flex flex-col p-6 items-center justify-center text-center overflow-y-auto">
              <Ribbon className="w-16 h-16 text-yellow-400 animate-bounce mb-2" />
              <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 uppercase">
                Battle Finished!
              </h1>
              <p className="text-gray-400 text-sm mt-1">Post match tactical statistics synchronized with Firestore.</p>

              <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl max-w-md w-full mt-6 space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Match Opponent</span>
                  <span className="font-bold text-white">{matchOpponent?.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400 font-mono">Sparks Virtual Reward</span>
                  <span className="font-bold text-yellow-400 font-mono">+{profile.wins % 2 === 0 ? 50 : 35} Sparks</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Tactical ELO change</span>
                  <span className="font-bold text-green-400">+50 ELO Points</span>
                </div>

                {aiReport && (
                  <div className="bg-cyan-950/20 border border-cyan-800/40 p-3 rounded-lg text-xs leading-relaxed text-cyan-200">
                    <h4 className="font-black flex items-center gap-1 text-cyan-300 uppercase mb-2">
                      <Sparkles className="w-3.5 h-3.5" /> AI Advisor Deck Analyzer
                    </h4>
                    <p className="whitespace-pre-line text-[11px]">{aiReport}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => { setBattleState('lobby'); setActiveTab('Hub'); }}
                className="mt-8 px-8 py-3 bg-white text-black hover:bg-gray-200 font-black tracking-widest text-xs uppercase rounded-full shadow-lg"
              >
                Return to Battle Hub
              </button>
            </div>
          )}

          {/* MAIN ARENA PLAYGROUND ROW */}
          <div className="flex-grow flex flex-col lg:flex-row overflow-hidden w-full">
            {/* LEFT SIDEBAR: BATTLE FEED FEED AND GAME LOGS */}
            <div className="lg:w-80 h-40 lg:h-full bg-gray-950 border-r border-gray-900 flex flex-col p-3 order-3 lg:order-1 flex-shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Battlefield Combat Feed
              </h3>
              <div className="flex-grow overflow-y-auto mt-2 space-y-1.5 font-mono text-[10px] leading-relaxed text-gray-400 scrollbar-hide">
                {battleLogs.map((log, lIdx) => (
                  <div key={lIdx} className="p-1 px-2 rounded bg-gray-900/40 border-l border-gray-700">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* MIDDLE: THE TACTICAL 5x5 GRID FIELD */}
            <div className="flex-grow bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/10 via-black to-black p-4 flex flex-col justify-between overflow-y-auto order-1 lg:order-2">
              
              {/* OPPONENT ACTIVE PANEL */}
              <div>
                <div className="flex justify-between items-center bg-gray-900/60 p-2 rounded-xl mb-3 border border-red-900/20">
                  <div className="flex items-center gap-2">
                    <img src={matchOpponent?.avatar} className="w-8 h-8 rounded-full object-cover border border-red-700/40" />
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-red-400">{matchOpponent?.name}</h4>
                      <p className="text-[10px] text-gray-500">{matchOpponent?.rankTxt} | ELO {matchOpponent?.elo}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-extrabold uppercase font-mono rounded ${battleTurn === 'Opponent' ? 'bg-red-900 text-white animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                    AI Acting
                  </span>
                </div>

                {/* Opponent active grids: slots 0-4 */}
                <div className="grid grid-cols-5 gap-3">
                  {opponentSquad.slice(0, 5).map((oc, idx) => {
                    if (!oc) return null;
                    const isFront = idx === 0 || idx === 1;
                    const isDead = oc.hp <= 0;
                    return (
                      <div 
                        key={idx}
                        onClick={() => {
                          if (validTargetGroup === 'enemy' || validTargetGroup === 'front-row' && isFront || validTargetGroup === 'back-row' && !isFront || validTargetGroup === 'all-enemy') {
                            castActionOnTarget(idx, true);
                          }
                        }}
                        className={`relative p-2 rounded-xl border flex flex-col items-center justify-between transition-all duration-300 min-h-[140px]
                          ${isDead ? 'opacity-30 border-gray-800 bg-gray-950/60' : 'bg-gray-900/80 border-gray-800'}
                          ${isFront ? 'ring-1 ring-red-950/40' : 'scale-95 border-dashed'}
                          ${validTargetGroup && !isDead ? 'cursor-crosshair ring-2 ring-red-500 hover:bg-red-950/30' : ''}`}
                      >
                        {/* HP ratio */}
                        <div className="w-full text-center">
                          <span className="text-[9px] font-mono text-gray-400 block truncate">{isFront ? 'FRONT' : 'BACK'} {idx + 1}</span>
                          <span className="text-[10px] font-bold text-red-400 block">{oc.hp} / {oc.maxHp} HP</span>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden mt-1 w-full">
                            <div className="bg-red-500 h-full" style={{ width: `${(oc.hp / oc.maxHp) * 100}%` }}></div>
                          </div>
                        </div>

                        {/* Avatar */}
                        <div className="relative mt-2">
                          <img src={oc.avatarUrl} className={`w-12 h-12 rounded-full object-cover border ${isDead ? 'border-gray-800 grayscale' : 'border-gray-700'}`} />
                          {oc.status.poison > 0 && <span className="absolute -bottom-1 -right-1 text-xs">🧪</span>}
                          {oc.status.burn > 0 && <span className="absolute -bottom-1 -left-1 text-xs">🔥</span>}
                          {oc.status.stun > 0 && <span className="absolute -top-1 -right-1 text-xs">⚡</span>}
                          {oc.status.taunt > 0 && <span className="absolute -top-1 -left-1 text-xs animate-ping">🛡️</span>}
                        </div>

                        <span className="text-[10px] font-extrabold block truncate w-full mt-2 text-center text-gray-300">{oc.name.split(' ')[0]}</span>
                        
                        {/* Energy bubble */}
                        <div className="flex gap-0.5 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < oc.energy ? 'bg-orange-500' : 'bg-gray-800'}`}></div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GRID CENTER STATUS INDICATOR */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-4"></div>

              {/* PLAYER ACTIVE PANEL */}
              <div>
                {/* Pos 0-4 active */}
                <div className="grid grid-cols-5 gap-3">
                  {playerSquad.slice(0, 5).map((oc, idx) => {
                    if (!oc) return null;
                    const isFront = idx === 0 || idx === 1;
                    const isDead = oc.hp <= 0;
                    const isSelected = selectedActOCIndex === idx;

                    return (
                      <div 
                        key={idx}
                        onClick={() => {
                          if (validTargetGroup === 'friendly' || validTargetGroup === 'self' && isSelected || validTargetGroup === 'all-friendly') {
                            castActionOnTarget(idx, false);
                          } else if (!isDead && battleTurn === 'Player' && !oc.hasActed) {
                            setSelectedActOCIndex(idx);
                            setCastingActionIdx(null);
                            setValidTargetGroup(null);
                          }
                        }}
                        className={`relative p-2 rounded-xl border flex flex-col items-center justify-between transition-all duration-300 min-h-[140px]
                          ${isDead ? 'opacity-30 border-gray-800 bg-gray-950/60' : 'bg-gray-900 border-gray-700 hover:border-cyan-500'}
                          ${isFront ? 'ring-1 ring-cyan-950/40 bg-gray-900/60' : 'scale-95 border-dashed bg-gray-900/40'}
                          ${isSelected ? 'ring-2 ring-cyan-400 bg-cyan-950/30' : ''}
                          ${oc.hasActed ? 'brightness-50 grayscale' : ''}
                          ${validTargetGroup && !isDead ? 'cursor-crosshair ring-2 ring-green-500 hover:bg-green-950/30' : ''}`}
                      >
                        {/* HP Ratio */}
                        <div className="w-full text-center">
                          <span className="text-[9px] font-mono text-gray-400 block truncate">{isFront ? 'FRONT' : 'BACK'} {idx + 1}</span>
                          <span className="text-[10px] font-bold text-green-400 block">{oc.hp} / {oc.maxHp} HP</span>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden mt-1 w-full">
                            <div className="bg-green-500 h-full" style={{ width: `${(oc.hp / oc.maxHp) * 100}%` }}></div>
                          </div>
                        </div>

                        {/* Avatar */}
                        <div className="relative mt-2">
                          <img src={oc.avatarUrl} className={`w-12 h-12 rounded-full object-cover border ${isDead ? 'border-gray-800 grayscale' : 'border-gray-700'}`} />
                          {oc.status.poison > 0 && <span className="absolute -bottom-1 -right-1 text-xs">🧪</span>}
                          {oc.status.burn > 0 && <span className="absolute -bottom-1 -left-1 text-xs">🔥</span>}
                          {oc.status.stun > 0 && <span className="absolute -top-1 -right-1 text-xs">⚡</span>}
                          {oc.status.taunt > 0 && <span className="absolute -top-1 -left-1 text-xs animate-ping">🛡️</span>}
                        </div>

                        <span className="text-[10px] font-extrabold block truncate w-full mt-2 text-center text-gray-300">{oc.name.split(' ')[0]}</span>
                        
                        {/* Energy Display */}
                        <div className="flex gap-0.5 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < oc.energy ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-gray-800'}`}></div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center bg-gray-900/60 p-2 rounded-xl mt-3 border border-cyan-900/20">
                  <span className="text-xs text-gray-400">Total 5 Active positions monitored</span>
                  <div className="flex gap-4">
                    <span className="text-xs text-gray-400">Bench OCs:</span>
                    {playerSquad.slice(5, 7).map((benchCard, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-1.5 bg-gray-950 p-1 px-4 rounded-xl border border-gray-805">
                        <UserAvatar src={benchCard?.avatarUrl} size="6" />
                        <span className="text-[10px] font-bold text-gray-300">{benchCard?.name.split(' ')[0]}</span>
                        <span className="text-[9px] text-orange-400 font-mono">⚡{benchCard?.energy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR: SELECTED OC ACTION DECK controls */}
            <div className="lg:w-80 bg-gray-950 border-l border-gray-900 p-4 flex flex-col justify-between order-2 lg:order-3 flex-shrink-0">
              
              {selectedActOCIndex !== null ? (
                <div className="flex-grow flex flex-col justify-between space-y-4">
                  {(() => {
                    const activeOC = playerSquad[selectedActOCIndex];
                    return (
                      <>
                        <div className="text-left border-b border-gray-900 pb-3">
                          <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold block">{activeOC.role} Core Template Attached</span>
                          <h4 className="text-lg font-black text-white">{activeOC.name}</h4>
                          <p className="text-xs text-gray-400 leading-relaxed mt-1">Select an action moveset to execute, target locks will highlights on the arena grid.</p>
                          
                          <div className="flex items-center gap-2 mt-2 bg-gray-900/40 p-2 rounded border border-gray-850">
                            <span className="text-xs text-indigo-400 font-bold">Element Align:</span>
                            <span className="text-xs font-mono font-black">{activeOC.element} {ELEMENT_ICONS[activeOC.element]}</span>
                          </div>
                        </div>

                        {/* Lists 3 Customizable Action Slots */}
                        <div className="flex-grow space-y-3 pt-2">
                          {activeOC.actions.map((act, actIdx) => {
                            const actCustomName = activeOC.customActionNames ? activeOC.customActionNames[actIdx] : act.name;
                            const isCasting = castingActionIdx === actIdx;
                            return (
                              <button
                                key={actIdx}
                                onClick={() => prepareCastAction(actIdx)}
                                className={`w-full p-2.5 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between items-start
                                  ${isCasting ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="text-xs font-bold text-white uppercase">{actCustomName}</span>
                                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-0.5">⚡ {act.energyCost} EN</span>
                                </div>
                                <span className="text-[10px] text-gray-400 leading-relaxed mt-1 block">
                                  {act.effectType}: {act.magnitude} magnitude | targeting <b>{act.targeting}</b>
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Substitution block trigger */}
                        <div className="border-t border-gray-900 pt-3">
                          <h5 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Tactical Substitution Menu</h5>
                          <div className="flex gap-2.5">
                            {playerSquad.slice(5, 7).map((bench, bIdx) => {
                              const overallIdx = 5 + bIdx;
                              return (
                                <button
                                  key={bIdx}
                                  onClick={() => executeSubstitution(selectedActOCIndex, overallIdx)}
                                  disabled={activeSubstUsed || bench.hp <= 0}
                                  className="flex-1 p-2 bg-gray-905 border border-gray-800 hover:border-cyan-400 rounded-xl text-left text-[9px] font-mono leading-tight disabled:opacity-40"
                                >
                                  Swap in:<br />
                                  <b className="text-white block truncate">{bench.name.split(' ')[0]}</b>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-grow flex-col items-center justify-center text-center p-6 text-gray-500">
                  <Play className="w-12 h-12 text-gray-800 animate-pulse mb-2" />
                  <p className="text-xs font-mono">TACTICAL ACTIONS LOCKED</p>
                  <p className="text-[10px] text-gray-400 mt-1">Select any of your alive active OCs on the grid who has not acted yet this turn.</p>
                </div>
              )}

              {/* Turn Control button bottom */}
              <div className="border-t border-gray-900 pt-4 mt-4">
                <button
                  onClick={handleEndPlayerTurn}
                  disabled={battleTurn !== 'Player'}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-sm rounded-xl uppercase tracking-widest disabled:opacity-55 shadow-lg flex items-center justify-center gap-2"
                >
                  {battleTurn === 'Player' ? 'End My Action Turn' : 'Wait... rival is deciding'}
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : (
        // -------------------------------------------------------------
        // HUB AND STANDARD MENU PAGES
        // -------------------------------------------------------------
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          
          {/* HUB SIDE NAVIGATION RAIL */}
          <nav className="w-full md:w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex md:flex-col justify-around md:justify-start md:p-3 gap-2 overflow-x-auto">
            <div className="hidden md:block p-3 border-b border-gray-800 mb-4">
              <h1 className="text-sm font-black text-white/50 tracking-widest uppercase">MainMenu</h1>
            </div>
            
            {[
              { id: 'Hub', label: 'League Hub', icon: <Compass className="w-4 h-4" /> },
              { id: 'Squad', label: 'Squad Builder', icon: <Dices className="w-4 h-4" /> },
              { id: 'Shop', label: 'Sparks Shop', icon: <ShoppingBag className="w-4 h-4" /> },
              { id: 'Forge', label: 'OC Forge/Crafting', icon: <Hammer className="w-4 h-4" /> },
              { id: 'Leaderboard', label: 'Leaderboard', icon: <Award className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MenuTab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all w-full min-w-[120px] md:min-w-0
                  ${activeTab === tab.id ? 'bg-red-950/20 border-l-4 border-red-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-850'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* DYNAMIC VIEWPORT BODY */}
          <main className="flex-grow overflow-y-auto bg-black p-4 md:p-6 md:pb-24">
            
            {/* VIEWCASE: LEAGUE HUB */}
            {activeTab === 'Hub' && (
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Ranking visualizer banner */}
                <div className="bg-gradient-to-r from-red-950/40 via-gray-950 to-[#0e0e12] border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-red-400">Tactical Duel Rating System</span>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Active Battle Profile</h2>
                    <p className="text-xs text-gray-400">Wins: <b className="text-white">{profile.wins}</b> | Losses: <b className="text-white">{profile.losses}</b> | Ratio: <b className="text-white">{profile.wins + profile.losses === 0 ? '0%' : Math.round((profile.wins / (profile.wins + profile.losses)) * 100) + '%'}</b></p>
                  </div>
                  {renderLeagueBadge(profile.battlePower)}
                </div>

                {/* Queue launchers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-905 border border-gray-800 p-5 rounded-xl flex flex-col justify-between">
                    <div className="text-left mb-4">
                      <h3 className="text-lg font-bold text-white uppercase">Ranked Matchmaking Queue</h3>
                      <p className="text-xs text-gray-400 mt-1">Construct your squad of 7. Risks ELO rating Demotion/Promotion. Earn Sparks on Victory drops.</p>
                    </div>
                    <button 
                      onClick={() => startMatchmaking(true)}
                      className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase rounded-xl tracking-wider shadow-lg transform active:scale-95 transition-transform"
                    >
                      Search Ranked Arena Match
                    </button>
                  </div>

                  <div className="bg-gray-905 border border-gray-800 p-5 rounded-xl flex flex-col justify-between">
                    <div className="text-left mb-4">
                      <h3 className="text-lg font-bold text-white uppercase">Daily Supply Portal</h3>
                      <p className="text-xs text-gray-400 mt-1">Claim your daily virtual Sparks fund of +150 to spend on Rotating templates or Celestial pack gachas.</p>
                    </div>
                    <button 
                      onClick={claimDailySparks}
                      disabled={claimedDaily}
                      className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black text-sm uppercase rounded-xl tracking-wider disabled:opacity-40"
                    >
                      {claimedDaily ? 'Supply Claimed for Today' : 'Claim Daily Sparks Supply (+150)'}
                    </button>
                  </div>
                </div>

                {/* Match history rows */}
                <div className="bg-gray-905 border border-gray-850 rounded-2xl p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 pb-3 border-b border-gray-850 flex items-center gap-1.5 mb-3">
                    <History className="w-4 h-4 text-cyan-400" /> Recent Spark Clash Matches (Match History)
                  </h3>
                  <div className="space-y-2">
                    {transactions.filter((tx: any) => tx.type.toLowerCase().includes('win') || tx.type.toLowerCase().includes('defeat')).length > 0 ? (
                      transactions.filter((tx: any) => tx.type.toLowerCase().includes('win') || tx.type.toLowerCase().includes('defeat')).map((tx: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-900/40 p-2.5 rounded-xl border border-gray-850">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${tx.type.toLowerCase().includes('win') ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
                              {tx.type}
                            </span>
                            <span className="text-xs text-gray-300 font-medium">{tx.desc}</span>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">{tx.date}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic py-4 text-center">No ranked combat logs logged. Launch matchmaking above!</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* VIEWCASE: SQUAD BUILD (7 Assigned OCs) */}
            {activeTab === 'Squad' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-left border-b border-gray-850 pb-3 mb-4">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Vanguard Squad Builder</h2>
                  <p className="text-xs text-gray-400 mt-1">Assign exactly 7 forged OC cards to construct your deck: 5 Active Slots (Grid 1-5) and 2 Bench Slots (substitute support).</p>
                </div>

                {/* Slot matrix layout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                  {Array.from({ length: 7 }).map((_, slotIdx) => {
                    const assignedCardId = squadDeck?.cardIds[slotIdx];
                    const card = assignedCardId ? profile.inventory.find(i => i.id === assignedCardId) : null;
                    const oc = card ? availableOcs.find(o => o.id === card.characterId) : null;

                    const isActiveRole = slotIdx < 5;

                    return (
                      <div 
                        key={slotIdx}
                        className={`p-3 rounded-xl border flex flex-col justify-between items-center text-center relative min-h-[160px]
                          ${isActiveRole ? 'bg-gray-900 border-gray-800' : 'bg-gradient-to-t from-gray-950 to-gray-900 border-dashed border-gray-700'}`}
                      >
                        <span className="text-[9px] uppercase font-mono tracking-widest text-gray-500">Slot {slotIdx + 1} {isActiveRole ? '(Active)' : '(Bench)'}</span>
                        
                        {card && oc ? (
                          <>
                            <img src={oc.imageUrl} className="w-12 h-12 rounded-full object-cover border border-gray-700 my-2" />
                            <div className="w-full text-center">
                              <span className="text-[10px] font-extrabold text-white block truncate">{card.customName}</span>
                              <span className="text-[9px] text-gray-500 block truncate">{oc.name}</span>
                              <span className="text-[10px] text-green-400 font-bold block mt-1">HP: {calculateCardHP(card.templateId, staticTemplates.find(t => t.id === card.templateId)?.role || 'Warrior')}</span>
                            </div>

                            <button 
                              onClick={() => handleUnassignSlot(slotIdx)}
                              className="text-red-400 hover:text-red-500 text-[10px] mt-2 block hover:underline"
                            >
                              Unassign
                            </button>
                          </>
                        ) : (
                          <div className="text-center py-4 flex flex-col items-center justify-center flex-grow">
                            <Plus className="w-4 h-4 text-gray-600 block mb-1" />
                            <span className="text-[10px] text-gray-500 font-mono">EMPTY</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Customizable Action move filter details inside inventory */}
                <div className="bg-gray-905 border border-gray-850 p-4 rounded-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-850 mb-4">
                    Your Forged OC Cards Inventory ({profile.inventory.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.inventory.map(card => {
                      const temp = staticTemplates.find(t => t.id === card.templateId);
                      const oc = availableOcs.find(o => o.id === card.characterId);
                      if (!temp) return null;

                      // Check which slot currently assigned
                      const activeSlotIdx = squadDeck?.cardIds.indexOf(card.id);

                      return (
                        <div key={card.id} className="p-3 bg-gray-900 rounded-xl border border-gray-800 flex justify-between gap-4">
                          <div className="flex gap-3">
                            <img src={oc?.imageUrl} className="w-14 h-14 rounded-xl object-cover border border-gray-700" />
                            <div className="text-left space-y-0.5">
                              <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                                {card.customName} 
                                <span className="text-[8px] uppercase tracking-wider font-mono text-cyan-400 bg-cyan-950 px-1 rounded">
                                  {temp.tier}
                                </span>
                              </h4>
                              <p className="text-[10px] text-gray-400 font-mono">{oc?.name} | {temp.role}</p>
                              <p className="text-[9px] text-gray-500 leading-normal line-clamp-1">{temp.flavourText}</p>
                              
                              {/* Show customizable actions */}
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                {(card as any).customActionNames?.map((actName: string, iIdx: number) => (
                                  <span key={iIdx} className="text-[8px] bg-gray-950 px-1.5 py-0.5 rounded border border-gray-800 block">
                                    Slot {iIdx + 1}: {actName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between items-end shrink-0 select-none">
                            <button
                              onClick={() => startCustomizing(card)}
                              className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Customize Moves
                            </button>

                            <div className="space-y-1.5 mt-4">
                              <span className="text-[9px] text-gray-500 block">Assign to Squad:</span>
                              <div className="flex gap-1">
                                {Array.from({ length: 7 }).map((_, slotIdx) => (
                                  <button
                                    key={slotIdx}
                                    onClick={() => handleAssignToSquad(card.id, slotIdx)}
                                    className={`w-6 h-6 rounded-md text-[10px] font-bold border transition-colors
                                      ${activeSlotIdx === slotIdx ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-500'}`}
                                  >
                                    {slotIdx + 1}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {profile.inventory.length === 0 && (
                      <div className="col-span-2 py-8 text-center text-gray-500 bg-gray-900/10 border border-dashed border-gray-850 rounded-xl">
                        <UserX className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                        <p className="text-sm">No soulbound cards forged yet!</p>
                        <p className="text-xs text-cyan-400 mt-1 cursor-pointer underline" onClick={() => setActiveTab('Forge')}>
                          Go to OC Forge tab to bind Blank Templates to your characters
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RENAME MOVESET MODAL */}
                {customizingCardId && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl max-w-sm w-full space-y-4">
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white uppercase">Customize moves names</h3>
                        <p className="text-xs text-gray-400">Personalize move titles. Automatic profanity filtering will apply on save.</p>
                      </div>

                      <div className="space-y-2.5">
                        <div className="text-left">
                          <label className="text-[10px] uppercase font-bold text-gray-500">OC Card Name Customizer</label>
                          <input 
                            value={custCardName}
                            onChange={(e) => setCustCardName(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-805 p-2 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        {custActionNames.map((actName, slotIdx) => (
                          <div key={slotIdx} className="text-left">
                            <label className="text-[10px] uppercase font-bold text-gray-500">Action Slot {slotIdx + 1} Moveset</label>
                            <input 
                              value={actName}
                              onChange={(e) => {
                                const copy = [...custActionNames];
                                copy[slotIdx] = e.target.value;
                                setCustActionNames(copy);
                              }}
                              className="w-full bg-gray-950 border border-gray-805 p-2 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button 
                          onClick={() => setCustomizingCardId(null)}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-755 text-xs font-bold rounded-lg text-white"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={saveCustomNames}
                          className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 font-bold text-xs rounded-lg text-white"
                        >
                          Save Customizable Moves
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* VIEWCASE: SPARKS SHOP */}
            {activeTab === 'Shop' && (
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Visual portal rotating shop */}
                <div className="text-left border-b border-gray-850 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Rotating daily templates</h2>
                    <p className="text-xs text-gray-400 mt-1">Rotating selection of raw empty blanks. Purchase with Sparks and soulbind inside forge.</p>
                  </div>
                  <button 
                    onClick={handleRefreshMarket}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-901 border border-gray-800 rounded-lg hover:border-yellow-500 text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Rotate Selection (20 Sparks)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {shopTemplates.map((template, idx) => {
                    const price = TIER_DETAILS[template.tier].price;
                    return (
                      <div 
                        key={idx}
                        className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col justify-between text-left"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] text-gray-500 font-mono italic">{template.role}</span>
                            <span className={`text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded uppercase font-bold border ${TIER_DETAILS[template.tier].color}`}>
                              {template.tier}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-white text-sm mt-2">{template.name}</h4>
                          <p className="text-[10px] leading-relaxed text-gray-400 mt-1">{template.flavourText}</p>
                          
                          <div className="mt-3 bg-black/40 p-2 rounded-lg border border-gray-850 space-y-1 text-[9px] font-mono text-cyan-200">
                            <b>Actions Preview:</b>
                            {template.actions.map((act, aIdx) => (
                              <div key={aIdx} className="truncate">• {act.name} (en: {act.energyCost})</div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyTemplate(template)}
                          className="w-full mt-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1"
                        >
                          <Coins className="w-3.5 h-3.5 text-yellow-300" /> {price} Sparks
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* GACHA CARD PACKS DIVISION */}
                <div className="bg-gray-905 border border-gray-850 p-6 rounded-2xl">
                  <div className="text-left mb-4">
                    <h3 className="text-lg font-bold text-white uppercase flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-yellow-400" /> Celestial Gacha Opening simulator
                    </h3>
                    <p className="text-xs text-gray-400">Unlock hidden potential drops! Pack tier guarantees various rarity level multipliers.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { pack: 'Spark', cost: 50, desc: 'Drawns basic Natural or Unnatural Blanks.', odds: 'Common (70%) | Uncommon (30%)', bg: 'from-gray-950 to-gray-920' },
                      { pack: 'Relic', cost: 200, desc: 'Guarantees moderate Relic tier blanks or higher.', odds: 'Relic (50%) | Legendary (35%) | Mythic (15%)', bg: 'from-blue-950/40 to-gray-901' },
                      { pack: 'Legendary', cost: 500, desc: 'Highly blessed ancient pack containing rare drops.', odds: 'Legend (45%) | Mythic (35%) | Sky (15%) | Rune (5%)', bg: 'from-purple-950/40 to-gray-901' },
                      { pack: 'Cosmic', cost: 1000, desc: 'Singularity dimensions contain infinite power.', odds: 'Mythic (40%) | Sky (30%) | Rune (20%) | Cosmic (10%)', bg: 'from-yellow-950/30 to-gray-901' }
                    ].map((packObj, pIdx) => (
                      <div key={pIdx} className={`p-4 rounded-xl border border-gray-800 bg-gradient-to-b ${packObj.bg} flex flex-col justify-between text-left relative overflow-hidden`}>
                        <div>
                          <div className="flex justify-between items-center border-b border-gray-850 pb-2 mb-2">
                            <span className="text-sm font-black text-white">{packObj.pack} PACK</span>
                            <span className="text-xs font-mono text-yellow-400">⚡{packObj.cost} Sparks</span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-normal mb-3">{packObj.desc}</p>
                        </div>
                        <div className="space-y-3">
                          <span className="text-[8px] font-mono text-cyan-300 block bg-cyan-950/45 p-1 rounded">
                            Odds: {packObj.odds}
                          </span>
                          <button
                            onClick={() => handleBuyGacha(packObj.pack as any)}
                            className="w-full py-2 bg-gray-900 border border-gray-700 hover:border-yellow-400 hover:bg-black rounded-lg text-[10px] font-black uppercase text-white tracking-widest"
                          >
                            OPEN PACK
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* IMMERSIVE PACK OPENING SCREEN OVERLAY */}
                  {(isOpeningPack || revealedTemplate) && (
                    <div className="fixed inset-0 bg-black/95 z-[120] flex flex-col items-center justify-center p-6 text-center">
                      {isOpeningPack ? (
                        <div className="space-y-4">
                          <Compass className="w-20 h-20 text-yellow-400 animate-spin mx-auto mb-4" />
                          <h2 className="text-2xl font-black text-white uppercase tracking-wider">TEARING CELESTIAL FOILS...</h2>
                          <p className="text-xs text-gray-500 font-mono">Drawing random percentages of blanks database items</p>
                        </div>
                      ) : (
                        revealedTemplate && (
                          <div className="max-w-sm w-full bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-6 relative animate-fadeIn">
                            <div className="text-center">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 block">YOU UNLOCKED BLANK TEMPLATE</span>
                              <h2 className="text-2xl font-black text-white mt-1">{revealedTemplate.name}</h2>
                              <span className={`inline-block py-1 px-3 border rounded text-xs font-mono font-bold mt-2 ${TIER_DETAILS[revealedTemplate.tier].color}`}>
                                {revealedTemplate.tier} Tier Power
                              </span>
                            </div>

                            <div className="bg-black/60 p-4 rounded-xl border border-gray-850 text-left space-y-2">
                              <p className="text-xs text-gray-400 italic">" {revealedTemplate.flavourText} "</p>
                              <div className="h-px bg-gray-850 my-2"></div>
                              <div className="text-[10px] font-mono text-cyan-300 uppercase">3 CUSTOMIZABLE ACTION MOVES:</div>
                              {revealedTemplate.actions.map((act, actIdx) => (
                                <div key={actIdx} className="text-xs text-gray-300">
                                  ⚡ <b>{act.name}</b>: {act.effectType} targeting {act.targeting}
                                </div>
                              ))}
                            </div>

                            <button 
                              onClick={() => setRevealedTemplate(null)}
                              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                            >
                              Add to templates blank inventory
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}

                </div>

                {/* Microtransactions currency portal (Simulator) */}
                <div className="bg-[#0e0e12] border border-gray-800 p-5 rounded-xl">
                  <div className="text-left mb-4">
                    <h3 className="text-lg font-bold text-white uppercase flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-yellow-400" /> Virtual Coin Bundles portal (Sandbox purchase simulator)
                    </h3>
                    <p className="text-xs text-gray-400">Since we maintain offline balance integrity, click to fund test sparks instantly.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { sparks: 100, usd: 0.99, title: 'Handful of Sparks' },
                      { sparks: 550, usd: 4.99, title: 'Pouch of Sparks', best: true },
                      { sparks: 1200, usd: 9.99, title: 'Chest of Sparks' }
                    ].map((b, bIdx) => (
                      <div key={bIdx} className="p-4 bg-gray-900 rounded-xl border border-gray-850 text-center relative flex flex-col justify-between">
                        {b.best && <span className="absolute top-2 right-2 text-[8px] bg-red-600 font-bold px-1.5 py-0.5 rounded text-white animate-pulse">BEST VALUE</span>}
                        <div className="py-2 text-left">
                          <h4 className="text-xs text-gray-400">{b.title}</h4>
                          <span className="text-2xl font-black text-white">{b.sparks} Sparks</span>
                        </div>
                        <button
                          onClick={() => buySparkBundleSimulator(b.usd, b.sparks)}
                          className="w-full mt-4 py-2 bg-gray-950 border border-yellow-500/40 hover:border-yellow-400 text-xs font-mono font-bold text-yellow-300 uppercase tracking-widest rounded-lg"
                        >
                          BUY FOR ${b.usd}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* VIEWCASE: Forge / Crafting */}
            {activeTab === 'Forge' && (
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Soulbind Forge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-900">
                  <div className="space-y-4 text-left">
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Soulbind Forge</h2>
                      <p className="text-xs text-gray-400 mt-1">Bind a blank template to any of your custom characters. Soulbinding creates a unique item entry inside inventory which you can assign to your vanguard squads.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">1. Select Blank Template ({profile.templates.length})</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {profile.templates.map((tid, idx) => {
                            const details = staticTemplates.find(t => t.id === tid);
                            if (!details) return null;
                            const isSelected = soulbindTemplateId === tid;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSoulbindTemplateId(tid)}
                                className={`flex-shrink-0 p-2.5 rounded-xl border text-left min-w-[130px] flex flex-col justify-between select-none
                                  ${isSelected ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-500/20' : 'bg-gray-900 border-gray-800'}`}
                              >
                                <span className={`text-[8px] font-mono tracking-wider px-1 py-0.5 rounded border uppercase inline-block self-end ${TIER_DETAILS[details.tier].color}`}>
                                  {details.tier}
                                </span>
                                <span className="text-xs font-bold text-white block mt-2 truncate w-full">{details.name}</span>
                                <span className="text-[9px] text-gray-500">{details.role}</span>
                              </button>
                            );
                          })}

                          {profile.templates.length === 0 && (
                            <p className="text-xs text-gray-500 italic py-2">No templates blank slots available inside inventory. Purchase from the Sparks Shop tab!</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">2. Select Custom Original Character (OC)</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {availableOcs.map(oc => {
                            const isSelected = soulbindOcId === oc.id;
                            return (
                              <button
                                key={oc.id}
                                onClick={() => setSoulbindOcId(oc.id)}
                                className={`flex-shrink-0 p-2 rounded-xl border flex flex-col items-center text-center gap-1 min-w-[80px] select-none
                                  ${isSelected ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-500/20' : 'bg-gray-900 border-gray-800'}`}
                              >
                                <img src={oc.imageUrl} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                                <span className="text-[10px] text-white font-extrabold truncate w-full">{oc.name.split(' ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={handleSoulbind}
                        disabled={!soulbindTemplateId || !soulbindOcId}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-sm uppercase rounded-xl tracking-wider disabled:opacity-45"
                      >
                        Forge Custom Moveset OC Card
                      </button>
                    </div>
                  </div>

                  {/* Soulbind visualizer */}
                  <div className="bg-[#0b0b0f] border border-gray-850 rounded-2xl flex flex-col justify-center items-center p-6 text-center">
                    {soulbindTemplateId ? (
                      (() => {
                        const baseTemp = staticTemplates.find(t => t.id === soulbindTemplateId);
                        const matchedOc = availableOcs.find(o => o.id === soulbindOcId);
                        if (!baseTemp) return null;

                        return (
                          <div className="max-w-[200px] w-full aspect-[2/3] bg-gray-900 border-4 border-yellow-500 rounded-2xl flex flex-col justify-between p-3 overflow-hidden shadow-2xl relative">
                            <div className="flex justify-between items-start border-b border-gray-850 pb-1">
                              <span className="text-[9px] text-gray-500 font-mono leading-none uppercase">{baseTemp.role}</span>
                              <span className="text-[10px]">{ELEMENT_ICONS[baseTemp.element]}</span>
                            </div>

                            <div className="flex-grow flex flex-col justify-center items-center my-2">
                              <img src={matchedOc ? matchedOc.imageUrl : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'} className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500/40" />
                              <h4 className="font-extrabold text-sm text-yellow-400 mt-2 truncate w-full text-center">
                                {matchedOc ? `${matchedOc.name.split(' ')[0]}'s ${baseTemp.role}` : 'Soulbind card'}
                              </h4>
                              <p className="text-[9px] text-gray-500 leading-normal block mt-1">HP: {calculateCardHP(baseTemp.id, baseTemp.role)}</p>
                            </div>

                            <div className="bg-black/50 p-2 rounded border border-gray-800 text-[9px] font-mono leading-tight space-y-0.5 text-cyan-300">
                              <div>• {baseTemp.actions[0].name}</div>
                              <div>• {baseTemp.actions[1].name}</div>
                              <div>• {baseTemp.actions[2].name}</div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="space-y-2 text-gray-600 font-mono text-xs uppercase tracking-widest">
                        <Compass className="w-12 h-12 text-gray-800 mx-auto" />
                        <span>Soulbind Card Preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* FUSION CARD CRAFTING CENTER */}
                <div className="bg-gray-905 border border-gray-850 p-5 rounded-2xl text-left">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white uppercase flex items-center gap-1.5">
                      <Hammer className="w-5 h-5 text-cyan-400" /> Molecular fusion crafting (Combine 3)
                    </h3>
                    <p className="text-xs text-gray-400">Combine 3 identical tier raw templates blanks to fuse 1 random blank of the next tier level power.</p>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {profile.templates.map((tid, idx) => {
                      const details = staticTemplates.find(t => t.id === tid);
                      if (!details) return null;
                      const isSelected = craftingBlankIds.includes(tid);
                      return (
                        <div 
                          key={idx}
                          onClick={() => toggleCraftSelect(tid)}
                          className={`p-3 rounded-xl border flex flex-col justify-between min-w-[130px] h-[130px] cursor-pointer transition-all select-none
                            ${isSelected ? 'bg-cyan-950/20 border-cyan-400 ring-2 ring-cyan-500/20' : 'bg-gray-908 border-gray-800'}`}
                        >
                          <span className={`text-[8px] font-mono tracking-wider px-1 py-0.5 rounded border uppercase inline-block self-end ${TIER_DETAILS[details.tier].color}`}>
                            {details.tier}
                          </span>
                          <span className="text-xs font-bold text-white block mt-4 truncate w-full">{details.name}</span>
                          <span className="text-[9px] text-gray-500">{details.role}</span>
                        </div>
                      );
                    })}
                  </div>

                  {craftingBlankIds.length > 0 && (
                    <div className="bg-gray-900 border border-cyan-950/30 p-4 rounded-xl mt-4 flex items-center justify-between gap-4">
                      <div className="text-left space-y-1">
                        <span className="text-xs text-cyan-400 font-black uppercase">FUSION LIST:</span>
                        <p className="text-xs text-gray-400">Selected <b className="text-white">{craftingBlankIds.length}/3</b> templates to fuse.</p>
                      </div>
                      
                      <button
                        onClick={handleCraftTemplates}
                        disabled={craftingBlankIds.length !== 3 || isCrafting}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs uppercase rounded-xl disabled:opacity-40"
                      >
                        {isCrafting ? 'Fusing particles...' : 'Fuse Blank Templates'}
                      </button>
                    </div>
                  )}

                  {/* Crafted result overlay */}
                  {craftedResult && (
                    <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4">
                      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl max-w-sm w-full text-center space-y-5 animate-fadeIn">
                        <Sparkle className="w-12 h-12 text-yellow-400 mx-auto animate-spin" />
                        <h3 className="text-xl font-bold text-white uppercase">Fusion Successful!</h3>
                        
                        <div className="p-4 bg-black/40 rounded-xl border border-gray-850">
                          <span className={`text-[9px] font-mono tracking-widest uppercase border px-2 py-0.5 rounded font-bold ${TIER_DETAILS[craftedResult.tier].color}`}>
                            {craftedResult.tier} Tier Power
                          </span>
                          <h4 className="text-lg font-black text-white mt-2">{craftedResult.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">Attached moves preview: {craftedResult.actions[0].name}, {craftedResult.actions[1].name}</p>
                        </div>

                        <button 
                          onClick={() => setCraftedResult(null)}
                          className="w-full py-3 bg-red-600 text-white font-bold text-xs uppercase rounded-xl"
                        >
                          Conclude experiment
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* VIEWCASE: LEADERBOARDS */}
            {activeTab === 'Leaderboard' && (
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="text-left border-b border-gray-850 pb-3 mb-4">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Global Ranks Rating</h2>
                  <p className="text-xs text-gray-400 mt-1">Conquer the Cosmic leagues. Compare ratings with legendary duelists.</p>
                </div>

                <div className="bg-gray-905 border border-gray-850 rounded-2xl overflow-hidden text-left">
                  <div className="p-4 bg-gray-900 border-b border-gray-850">
                    <span className="text-xs font-bold text-gray-400 uppercase">Top 100 Global Active Competitors</span>
                  </div>

                  <div className="divide-y divide-gray-850">
                    {[
                      { rank: 1, name: 'Sarah Jenkins', elo: 2400, lIcon: '💎', ratio: '20-5 (80%)', color: 'text-cyan-400' },
                      { rank: 2, name: 'Darius Black', elo: 1800, lIcon: '🥇', ratio: '15-15 (50%)', color: 'text-yellow-500' },
                      { rank: 3, name: 'Alex Walker (You)', elo: profile.battlePower, lIcon: getLeagueAndIcon(profile.battlePower).icon, ratio: `${profile.wins}-${profile.losses} (${profile.wins + profile.losses === 0 ? '0%' : Math.round((profile.wins / (profile.wins + profile.losses)) * 100) + '%'})`, color: getLeagueAndIcon(profile.battlePower).color },
                      { rank: 4, name: 'Mike Chen', elo: 800, lIcon: '🥉', ratio: '1-8 (11%)', color: 'text-amber-700' }
                    ].sort((a, b) => b.elo - a.elo).map((player, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 px-4 hover:bg-gray-900/20">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-gray-500 font-extrabold w-4">{idx + 1}</span>
                          <span className="text-xl">{player.lIcon}</span>
                          <div>
                            <span className="font-extrabold text-sm text-white block">{player.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">Win Ratio: {player.ratio}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-mono font-black ${player.color}`}>{player.elo} Rating</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      )}

    </div>
  );
};

export default SparkClashPage;
