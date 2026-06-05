// ==========================================================================
// 중년기사 김봉식 룬 계산기 - 수학 연산 엔진 (calculator.js)
// ==========================================================================

// 1. 퍼센트 옵션 판정
function isPercentOption(idx) {
    return idx >= 2 && idx <= 24;
}

// 2. 단일 룬 스펙 연동 실효값 변환 (단일 룬 내부 전용)
function getEffectiveValue(optKey, value, specValues) {
    const mapping = SPEC_MAPPING[optKey];
    if (mapping) {
        const factor = specValues[mapping.key] || 0;
        return value * factor;
    }
    return value;
}

// 3. 룬 옵션 수치 기본 Min-Max 범위 계산
function calculateOptionValueRange(grade, level, nameKey) {
    const match = optionsData.find(o => o.name_key === nameKey);
    if (!match) return { min: 0, max: 0, idx: 0 };

    const gradeIdx = GRADES.indexOf(grade) + 1; // 1~8
    const baseValue = match[`grade_value_${gradeIdx}`] || 0;

    // 층수 보정 (옵션레벨) 스케일 팩터
    const scaleFactor = 1 + (level * (match.floor_value || 0));

    // 공식: 수치 = 랜덤값(min~max) * grade_value * (1 + level * floor_value)
    const finalMin = match.min * baseValue * scaleFactor;
    const finalMax = match.max * baseValue * scaleFactor;

    return {
        min: finalMin,
        max: finalMax,
        idx: match.idx
    };
}

// 4. 단일 룬 내부 옵션 합산 (상한선이 있는 Flat 옵션 Clamp 포함)
function getRuneInputStats(rune) {
    const stats = {}; // { optionKey: { value, min, max, idx } }
    rune.options.forEach((optName, idx) => {
        if (!optName) return;
        const range = calculateOptionValueRange(rune.grade, rune.level, optName);

        let inputVal = rune.optionValues[idx];
        if (isNaN(inputVal) || inputVal === null || inputVal === undefined) {
            inputVal = (range.min + range.max) / 2;
        }

        if (!stats[optName]) {
            stats[optName] = { value: 0, min: 0, max: 0, idx: range.idx };
        }
        stats[optName].value += inputVal;
        stats[optName].min += range.min;
        stats[optName].max += range.max;
    });

    // Clamp flat options 25-30 to their accumulate_max
    for (let optName in stats) {
        const matchOpt = optionsData.find(o => o.name_key === optName);
        if (matchOpt && matchOpt.accumulate_max > 0) {
            stats[optName].value = Math.min(stats[optName].value, matchOpt.accumulate_max);
            stats[optName].min = Math.min(stats[optName].min, matchOpt.accumulate_max);
            stats[optName].max = Math.min(stats[optName].max, matchOpt.accumulate_max);
        }
    }

    return stats;
}

// 5. 종합 최종 곱연산 배율 연산 엔진
function calculateCategoryMultiplierForSockets(sockets, spec, keys) {
    let multiplier = 1.0;

    // 1) 각 소켓의 장착 룬 데이터 정제 및 룬 내부 수치 합산
    const runeAggregated = sockets.map(socket => {
        if (!socket.equipped) return null;
        const stats = {};
        socket.options.forEach((optName, idx) => {
            if (!optName) return;
            const range = calculateOptionValueRange(socket.grade, socket.level, optName);
            let val = socket.optionValues[idx];
            if (val === undefined || isNaN(val) || val === null) {
                val = (range.min + range.max) / 2;
            }
            if (!stats[optName]) {
                stats[optName] = 0;
            }
            stats[optName] += val;
        });
        return stats;
    }).filter(s => s !== null);

    // 세트 카운트 집계
    const setCounts = {};
    sockets.forEach(socket => {
        if (socket.equipped && (socket.grade === "전설" || socket.grade === "신화" || socket.grade === "불멸") && socket.setName) {
            setCounts[socket.setName] = (setCounts[socket.setName] || 0) + 1;
        }
    });

    // 스킨 증가량 (Option 25) 합계 구하기
    let totalAddedSkins = 0;
    runeAggregated.forEach(stats => {
        if (stats["t_ui_maches_option_25"]) {
            totalAddedSkins += stats["t_ui_maches_option_25"];
        }
    });

    for (let setName in setCounts) {
        const count = setCounts[setName];
        const effectsForSet = setEffects.filter(s => s.name_key === setName);
        effectsForSet.forEach(set => {
            const checkSetSkinBuff = (buffOpt, buffVal) => {
                if (!buffOpt || !buffVal) return;
                let optKey = buffOpt;
                if (typeof optKey === 'number') {
                    optKey = `t_ui_maches_option_${String(optKey).padStart(2, '0')}`;
                }
                if (optKey === "t_ui_maches_option_25") {
                    totalAddedSkins += buffVal;
                }
            };
            if (set.option_active_count_1 && count >= set.option_active_count_1) {
                checkSetSkinBuff(set.option_number_1, set.option_value_1);
            }
            if (set.option_active_count_2 && count >= set.option_active_count_2) {
                checkSetSkinBuff(set.option_number_2, set.option_value_2);
            }
            if (set.option_active_count_3 && count >= set.option_active_count_3) {
                checkSetSkinBuff(set.option_number_3, set.option_value_3);
            }
        });
    }

    const totalAddedSkinsClamped = Math.min(totalAddedSkins, 30);
    const totalSkins = (spec.skins || 0) + totalAddedSkinsClamped;

    // 세트 효과로 얻은 일반/조건부 % 옵션 버프들을 집계
    const setBuffs = {};
    for (let setName in setCounts) {
        const count = setCounts[setName];
        const effectsForSet = setEffects.filter(s => s.name_key === setName);
        effectsForSet.forEach(set => {
            const collectSetBuff = (buffOpt, buffVal) => {
                if (!buffOpt || !buffVal) return;
                let optKey = buffOpt;
                if (typeof optKey === 'number') {
                    optKey = `t_ui_maches_option_${String(optKey).padStart(2, '0')}`;
                }
                if (optKey === "t_ui_maches_option_30" || optKey === "t_ui_maches_option_25") return; // Flat 옵션은 별도로 처리
                
                if (!setBuffs[optKey]) {
                    setBuffs[optKey] = 0;
                }
                setBuffs[optKey] += buffVal;
            };
            if (set.option_active_count_1 && count >= set.option_active_count_1) {
                collectSetBuff(set.option_number_1, set.option_value_1);
            }
            if (set.option_active_count_2 && count >= set.option_active_count_2) {
                collectSetBuff(set.option_number_2, set.option_value_2);
            }
            if (set.option_active_count_3 && count >= set.option_active_count_3) {
                collectSetBuff(set.option_number_3, set.option_value_3);
            }
        });
    }

    // 2) 카테고리 내 옵션 키별 곱연산 처리
    keys.forEach(key => {
        // Flat 옵션 30 (마몬의 권능) 특수 연산
        if (key === "t_ui_maches_option_30") {
            let totalOpt30 = 0;
            runeAggregated.forEach(stats => {
                if (stats[key] && stats[key] > 0) {
                    totalOpt30 += stats[key];
                }
            });
            // 세트 효과 포함
            for (let setName in setCounts) {
                const count = setCounts[setName];
                const effectsForSet = setEffects.filter(s => s.name_key === setName);
                effectsForSet.forEach(set => {
                    const checkSetOpt30 = (buffOpt, buffVal) => {
                        if (!buffOpt || !buffVal) return;
                        let optKey = buffOpt;
                        if (typeof optKey === 'number') {
                            optKey = `t_ui_maches_option_${String(optKey).padStart(2, '0')}`;
                        }
                        if (optKey === "t_ui_maches_option_30") {
                            totalOpt30 += buffVal;
                        }
                    };
                    if (set.option_active_count_1 && count >= set.option_active_count_1) {
                        checkSetOpt30(set.option_number_1, set.option_value_1);
                    }
                    if (set.option_active_count_2 && count >= set.option_active_count_2) {
                        checkSetOpt30(set.option_number_2, set.option_value_2);
                    }
                    if (set.option_active_count_3 && count >= set.option_active_count_3) {
                        checkSetOpt30(set.option_number_3, set.option_value_3);
                    }
                });
            }
            const totalOpt30Clamped = Math.min(totalOpt30, 100);
            if (totalOpt30Clamped > 0) {
                multiplier *= Math.pow(1.452, totalOpt30Clamped);
            }
        } else {
            // 크르르 유효 체크박스가 꺼진 경우 크르르 관련 옵션 패스
            if (!spec.krrrrActive && (key === "t_ui_maches_option_09" || key === "t_ui_maches_option_10")) {
                return;
            }

            // 1단위당 종합 기본 배율 구하기 (1 + 기본수치/100) 들의 곱연산
            let productTotal = 1.0;
            let hasOpt = false;

            runeAggregated.forEach(stats => {
                if (stats[key] && stats[key] > 0) {
                    productTotal *= (1 + stats[key] / 100);
                    hasOpt = true;
                }
            });

            // 세트 버프도 기본 수치 배율에 결합
            if (setBuffs[key] && setBuffs[key] > 0) {
                productTotal *= (1 + setBuffs[key] / 100);
                hasOpt = true;
            }

            if (hasOpt) {
                // 조건의 개수 (F) 결정
                let factor = 1.0;
                if (key === "t_ui_maches_option_23" || key === "t_ui_maches_option_24") {
                    factor = totalSkins;
                } else {
                    const mapping = SPEC_MAPPING[key];
                    if (mapping) {
                        factor = spec[mapping.key] || 0;
                    }
                }

                // 최종 공식: 1 + (기본배율곱 - 1) * 조건개수
                const optMult = 1 + (productTotal - 1) * factor;
                multiplier *= optMult;
            }
        }
    });

    // 3) 스킨 증가량 보너스 곱연산 (공격력 카테고리만 해당)
    if (keys === ATTACK_OPTIONS) {
        const netSkinsAdded = totalSkins - (spec.skins || 0);
        multiplier *= Math.pow(2.5, netSkinsAdded);
    }

    return multiplier;
}

// 6. 종합 룬 보드 통계 및 세트 상태 연산
function getCombinedBoardStats(sockets, spec) {
    const combinedStats = {}; // { optKey: { value, min, max, idx, rawValue } }

    // 스킨 증가량 구하기
    let totalAddedSkins = 0;
    const allKeys = new Set();
    
    sockets.forEach(socket => {
        if (!socket.equipped) return;
        socket.options.forEach((opt, idx) => {
            if (!opt) return;
            allKeys.add(opt);
            if (opt === "t_ui_maches_option_25") {
                let val = socket.optionValues ? socket.optionValues[idx] : undefined;
                if (val === undefined || isNaN(val) || val === null) {
                    const range = calculateOptionValueRange(socket.grade, socket.level, opt);
                    val = (range.min + range.max) / 2;
                }
                totalAddedSkins += val;
            }
        });
    });

    const setCounts = {};
    sockets.forEach(socket => {
        if (socket.equipped && (socket.grade === "전설" || socket.grade === "신화" || socket.grade === "불멸") && socket.setName) {
            setCounts[socket.setName] = (setCounts[socket.setName] || 0) + 1;
        }
    });

    const activeSets = [];
    const setBuffs = {}; // { optKey: sumOfBuffValues }
    
    for (let setName in setCounts) {
        const count = setCounts[setName];
        const effectsForSet = setEffects.filter(s => s.name_key === setName);
        effectsForSet.forEach(set => {
            const addSetOpt = (buffOpt, buffVal, reqCount) => {
                if (!buffOpt || !buffVal) return;
                let optKey = buffOpt;
                if (typeof optKey === 'number') {
                    optKey = `t_ui_maches_option_${String(optKey).padStart(2, '0')}`;
                }
                allKeys.add(optKey);
                activeSets.push({ setName, reqCount, buffOpt: optKey, buffVal });

                if (optKey === "t_ui_maches_option_25") {
                    totalAddedSkins += buffVal;
                } else if (optKey !== "t_ui_maches_option_30") {
                    // 일반 % 옵션만 1단위 결합을 위해 모음
                    setBuffs[optKey] = (setBuffs[optKey] || 0) + buffVal;
                }
            };
            if (set.option_active_count_1 && count >= set.option_active_count_1) {
                addSetOpt(set.option_number_1, set.option_value_1, set.option_active_count_1);
            }
            if (set.option_active_count_2 && count >= set.option_active_count_2) {
                addSetOpt(set.option_number_2, set.option_value_2, set.option_active_count_2);
            }
            if (set.option_active_count_3 && count >= set.option_active_count_3) {
                addSetOpt(set.option_number_3, set.option_value_3, set.option_active_count_3);
            }
        });
    }

    const totalAddedSkinsClamped = Math.min(totalAddedSkins, 30);
    const totalSkins = (spec.skins || 0) + totalAddedSkinsClamped;

    // 옵션별 최종 결합 값 계산
    allKeys.forEach(key => {
        const matchOpt = optionsData.find(o => o.name_key === key);
        const optIdx = matchOpt ? matchOpt.idx : 1;

        if (isPercentOption(optIdx)) {
            // 1단위당 종합 기본 배율 곱연산 (1 + 기본수치/100)
            let productRunes = 1.0;
            let productRunesMin = 1.0;
            let productRunesMax = 1.0;
            let hasOpt = false;

            sockets.forEach(socket => {
                if (!socket.equipped) return;
                let sumRune = 0;
                let sumRuneMin = 0;
                let sumRuneMax = 0;
                let hasRuneOpt = false;

                socket.options.forEach((opt, idx) => {
                    if (opt === key) {
                        hasRuneOpt = true;
                        hasOpt = true;
                        const range = calculateOptionValueRange(socket.grade, socket.level, opt);
                        let val = socket.optionValues ? socket.optionValues[idx] : undefined;
                        if (val === undefined || isNaN(val) || val === null) {
                            val = (range.min + range.max) / 2;
                        }
                        sumRune += val;
                        sumRuneMin += range.min;
                        sumRuneMax += range.max;
                    }
                });

                if (hasRuneOpt) {
                    productRunes *= (1 + sumRune / 100);
                    productRunesMin *= (1 + sumRuneMin / 100);
                    productRunesMax *= (1 + sumRuneMax / 100);
                }
            });

            // 세트 효과도 기본 수치 배율에 결합
            if (setBuffs[key] && setBuffs[key] > 0) {
                productRunes *= (1 + setBuffs[key] / 100);
                productRunesMin *= (1 + setBuffs[key] / 100);
                productRunesMax *= (1 + setBuffs[key] / 100);
                hasOpt = true;
            }

            if (hasOpt) {
                // 조건의 개수 (F)
                let factor = 1.0;
                if (key === "t_ui_maches_option_23" || key === "t_ui_maches_option_24") {
                    factor = totalSkins;
                } else {
                    const mapping = SPEC_MAPPING[key];
                    if (mapping) {
                        factor = spec[mapping.key] || 0;
                    }
                }

                // 종합 1단위 증가율 % (rawValue) = (기본 배율 곱 - 1) * 100
                const rawVal = (productRunes - 1) * 100;
                const rawMin = (productRunesMin - 1) * 100;
                const rawMax = (productRunesMax - 1) * 100;

                // 최종 적용 증가율 % = 1단위 증가율 * 조건개수
                const finalVal = rawVal * factor;
                const finalMin = rawMin * factor;
                const finalMax = rawMax * factor;

                combinedStats[key] = {
                    value: finalVal,
                    min: finalMin,
                    max: finalMax,
                    idx: optIdx,
                    rawValue: rawVal
                };
            }
        } else {
            // Flat 옵션은 전량 합산
            let sumVal = 0;
            let sumMin = 0;
            let sumMax = 0;

            sockets.forEach(socket => {
                if (!socket.equipped) return;
                socket.options.forEach((opt, idx) => {
                    if (opt === key) {
                        const range = calculateOptionValueRange(socket.grade, socket.level, opt);
                        let val = socket.optionValues ? socket.optionValues[idx] : undefined;
                        if (val === undefined || isNaN(val) || val === null) {
                            val = (range.min + range.max) / 2;
                        }
                        sumVal += val;
                        sumMin += range.min;
                        sumMax += range.max;
                    }
                });
            });

            // 세트 효과로 얻은 flat 수치 추가
            activeSets.forEach(set => {
                if (set.buffOpt === key) {
                    sumVal += set.buffVal;
                    sumMin += set.buffVal;
                    sumMax += set.buffVal;
                }
            });

            // 상한선 적용 (Flat 옵션 25~30)
            const matchOpt = optionsData.find(o => o.name_key === key);
            if (matchOpt && matchOpt.accumulate_max > 0) {
                sumVal = Math.min(sumVal, matchOpt.accumulate_max);
                sumMin = Math.min(sumMin, matchOpt.accumulate_max);
                sumMax = Math.min(sumMax, matchOpt.accumulate_max);
            }

            combinedStats[key] = {
                value: sumVal,
                min: sumMin,
                max: sumMax,
                idx: optIdx,
                rawValue: sumVal
            };
        }
    });

    return { combinedStats, activeSets };
}

// 7. 소환 결과 룬의 등반 층수 기여도 계산
function calculateRuneFloorContribution(rune, spec, level, includeKeys) {
    let addedSkins = 0;
    let opt30Val = 0;
    let multAtk = 1.0;
    let multKey = 1.0;

    const values = rune.options.map((opt, idx) => {
        return getFinalOptionValue(rune.grade, opt, rune.baseValues[idx], level);
    });

    for (let i = 0; i < rune.options.length; i++) {
        const opt = rune.options[i];
        if (!opt) continue;
        const val = values[i];

        if (opt === "t_ui_maches_option_25") {
            addedSkins += val;
        } else if (opt === "t_ui_maches_option_30") {
            opt30Val += val;
        }
    }

    const addedSkinsClamped = Math.min(addedSkins, 30);
    const totalSkins = (spec.skins || 0) + addedSkinsClamped;

    // 일반 및 조건부 % 옵션들의 1단위 결합 계산
    const optGroup = {};
    for (let i = 0; i < rune.options.length; i++) {
        const opt = rune.options[i];
        if (!opt) continue;
        const val = values[i];

        if (opt === "t_ui_maches_option_25" || opt === "t_ui_maches_option_26" || opt === "t_ui_maches_option_27" || opt === "t_ui_maches_option_28" || opt === "t_ui_maches_option_29") {
            continue;
        }
        if (opt === "t_ui_maches_option_30") {
            continue;
        }

        if (ATTACK_OPTIONS.includes(opt)) {
            if (!spec.krrrrActive && (opt === "t_ui_maches_option_09" || opt === "t_ui_maches_option_10")) {
                continue;
            }
            optGroup[opt] = (optGroup[opt] || 0) + val;
        }

        if (KEY_OPTIONS.includes(opt)) {
            optGroup[opt] = (optGroup[opt] || 0) + val;
        }
    }

    // 각 옵션의 기본배율곱 후 조건곱(F) 적용
    for (let opt in optGroup) {
        let factor = 1.0;
        if (opt === "t_ui_maches_option_23") {
            factor = totalSkins;
        } else {
            const mapping = SPEC_MAPPING[opt];
            if (mapping) {
                factor = spec[mapping.key] || 0;
            }
        }

        const optMult = 1 + (optGroup[opt] / 100) * factor;

        if (ATTACK_OPTIONS.includes(opt)) {
            multAtk *= optMult;
        }
        if (KEY_OPTIONS.includes(opt)) {
            multKey *= optMult;
        }
    }

    // Flat 옵션 30 (마몬) 적용
    if (opt30Val > 0) {
        const opt30Clamped = Math.min(opt30Val, 100);
        multAtk *= Math.pow(1.452, opt30Clamped);
    }

    // 스킨 추가 보너스 배율 적용
    multAtk *= Math.pow(2.5, addedSkinsClamped);

    const floor_atk = multAtk > 0 ? Math.log(multAtk) / Math.log(1.05) : 0;

    if (includeKeys) {
        const mult_key_combined = multKey * Math.pow(1.004, floor_atk);
        return mult_key_combined > 0 ? Math.log(mult_key_combined) / Math.log(1.004) : 0;
    } else {
        return floor_atk;
    }
}
