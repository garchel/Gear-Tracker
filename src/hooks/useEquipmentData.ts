import { useState, useEffect } from "react";
import { Equipment, EquipmentModel, EquipmentState } from "../types/equipment";
import { StateHistoryEntry, PositionHistoryEntry } from "../types/history";

export function useEquipmentData() {
    // States for storing data
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [equipmentModels, setEquipmentModels] = useState<EquipmentModel[]>([]);
    const [equipmentStates, setEquipmentStates] = useState<EquipmentState[]>([]);
    const [stateHistory, setStateHistory] = useState<StateHistoryEntry[]>([]);
    const [positionHistory, setPositionHistory] = useState<PositionHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    // Derived state for equipment names
    const [equipmentNames, setEquipmentNames] = useState<Record<string, string>>({});

    // Fetch data from public/data folder
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch all required JSON files
                const [
                    equipmentData,
                    equipmentModelData,
                    equipmentStateData,
                    stateHistoryData,
                    positionHistoryData
                ] = await Promise.all([
                    fetch('./data/equipment.json').then(res => res.json()),
                    fetch('./data/equipmentModel.json').then(res => res.json()),
                    fetch('./data/equipmentState.json').then(res => res.json()),
                    fetch('./data/equipmentStateHistory.json').then(res => res.json()),
                    fetch('./data/equipmentPositionHistory.json').then(res => res.json())
                ]);
                
                // Set basic data to state
                setEquipment(equipmentData);
                setEquipmentModels(equipmentModelData);
                setEquipmentStates(equipmentStateData);
                
                // Process state history data - flatten the nested structure
                const flattenedStateHistory: StateHistoryEntry[] = [];
                stateHistoryData.forEach((item: { equipmentId: string; states: Array<{ equipmentStateId: string; date: string }> }) => {
                    if (item.equipmentId && Array.isArray(item.states)) {
                        item.states.forEach((state: { equipmentStateId: string; date: string }) => {
                            flattenedStateHistory.push({
                                equipmentId: item.equipmentId,
                                equipmentStateId: state.equipmentStateId,
                                timestamp: state.date
                            });
                        });
                    }
                });
                setStateHistory(flattenedStateHistory);
                
                // Process position history data - flatten the nested structure
                const flattenedPositionHistory: PositionHistoryEntry[] = [];
                positionHistoryData.forEach((item: { equipmentId: string; positions: Array<{ lat: number; lon: number; date: string }> }) => {
                    if (item.equipmentId && Array.isArray(item.positions)) {
                        item.positions.forEach((pos: { lat: number; lon: number; date: string }) => {
                            flattenedPositionHistory.push({
                                equipmentId: item.equipmentId,
                                position: [pos.lat, pos.lon],
                                timestamp: pos.date
                            });
                        });
                    }
                });
                setPositionHistory(flattenedPositionHistory);
                
                // Create a lookup object for equipment names
                const namesLookup: Record<string, string> = {};
                
                // Group equipment by type for sequential numbering
                const truckCount = { count: 1 };
                const grappleCount = { count: 1 };
                const harvesterCount = { count: 1 };
                const otherCount = { count: 1 };
                
                equipmentData.forEach((eq: Equipment) => {
                    const model = equipmentModelData.find((m: EquipmentModel) => m.id === eq.equipmentModelId);
                    const modelName = model?.name || 'Desconhecido';
                    
                    // Format the name based on the model type with sequential numbering
                    let formattedName = '';
                    if (modelName.toLowerCase().includes('caminhão')) {
                        formattedName = `Caminhão ${truckCount.count}`;
                        truckCount.count++;
                    } else if (modelName.toLowerCase().includes('garra')) {
                        formattedName = `Garra ${grappleCount.count}`;
                        grappleCount.count++;
                    } else if (modelName.toLowerCase().includes('harvester')) {
                        formattedName = `Colheitadeira ${harvesterCount.count}`;
                        harvesterCount.count++;
                    } else {
                        // Default format for other equipment types
                        formattedName = `${modelName} ${otherCount.count}`;
                        otherCount.count++;
                    }
                    
                    namesLookup[eq.id] = formattedName;
                });
                setEquipmentNames(namesLookup);
                
                setLoading(false);
            } catch (err) {
                console.error("Error loading equipment data:", err);
                setError(err instanceof Error ? err : new Error('Failed to load data'));
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    return {
        equipment,
        equipmentModels,
        equipmentStates,
        stateHistory,
        positionHistory,
        equipmentNames,
        loading,
        error
    };
}