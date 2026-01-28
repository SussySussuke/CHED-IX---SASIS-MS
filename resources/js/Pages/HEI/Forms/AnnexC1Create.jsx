import React from 'react';
import SharedAnnexCreate from '../../../Components/Annex/SharedAnnexCreate';

const AnnexC1Create = ({ availableYears, existingBatches, defaultYear, isEditing = false }) => {
    return (
        <SharedAnnexCreate
            annexLetter="C-1"
            availableYears={availableYears}
            existingBatches={existingBatches}
            defaultYear={defaultYear}
            isEditing={isEditing}
        />
    );
};

export default AnnexC1Create;
