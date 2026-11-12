import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { IconButton, ListItemText, Menu, MenuItem, Stack, Tooltip } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { resourceStatusLabels } from '../../../theme';
import type { Resource, ResourceStatus } from '../types';

const STATUSES = Object.keys(resourceStatusLabels) as ResourceStatus[];

export type ResourceRowActionsProps = {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onChangeStatus: (resource: Resource, status: ResourceStatus) => void;
};

/** Acțiunile de pe un rând din catalog: editare, schimbarea stării, ștergere. */
export function ResourceRowActions({
  resource,
  onEdit,
  onDelete,
  onChangeStatus,
}: ResourceRowActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const name = resource.denumire ?? '';

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);
  const handleSelectStatus = (status: ResourceStatus) => {
    handleCloseMenu();
    onChangeStatus(resource, status);
  };

  return (
    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
      <Tooltip title="Editează">
        <IconButton size="small" aria-label={`Editează ${name}`} onClick={() => onEdit(resource)}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Schimbă starea">
        <IconButton
          size="small"
          aria-label={`Schimbă starea pentru ${name}`}
          aria-haspopup="menu"
          onClick={handleOpenMenu}
        >
          <SwapHorizIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Șterge">
        <IconButton
          size="small"
          color="error"
          aria-label={`Șterge ${name}`}
          onClick={() => onDelete(resource)}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={handleCloseMenu}>
        {STATUSES.map((status) => (
          <MenuItem
            key={status}
            disabled={status === resource.stare}
            onClick={() => handleSelectStatus(status)}
          >
            <ListItemText>{resourceStatusLabels[status]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}
