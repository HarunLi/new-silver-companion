"""Initial migration

Revision ID: 6a8aa45047c6
Revises: 
Create Date: 2025-02-08 23:54:42.018699

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a8aa45047c6'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('guides',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('category', sa.Enum('TRANSPORTATION', 'PAYMENT', 'HEALTHCARE', 'ENTERTAINMENT', 'TECHNOLOGY', 'DAILY_LIFE', 'OTHER', name='guidecategory'), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('difficulty_level', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_guides_id'), 'guides', ['id'], unique=False)
    op.create_index(op.f('ix_guides_title'), 'guides', ['title'], unique=False)
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(), nullable=True),
    sa.Column('phone', sa.String(), nullable=True),
    sa.Column('full_name', sa.String(), nullable=True),
    sa.Column('hashed_password', sa.String(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('is_superuser', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)
    op.create_table('activities',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('type', sa.Enum('EXERCISE', 'ENTERTAINMENT', 'EDUCATION', 'TRAVEL', 'SOCIAL', 'OTHER', name='activitytype'), nullable=True),
    sa.Column('status', sa.Enum('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', name='activitystatus'), nullable=True),
    sa.Column('location', sa.String(), nullable=True),
    sa.Column('max_participants', sa.Integer(), nullable=True),
    sa.Column('start_time', sa.DateTime(), nullable=True),
    sa.Column('end_time', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('organizer_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['organizer_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activities_id'), 'activities', ['id'], unique=False)
    op.create_index(op.f('ix_activities_title'), 'activities', ['title'], unique=False)
    op.create_table('guide_steps',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('image_url', sa.String(), nullable=True),
    sa.Column('step_order', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('guide_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['guide_id'], ['guides.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_guide_steps_id'), 'guide_steps', ['id'], unique=False)
    op.create_table('pets',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('type', sa.Enum('CAT', 'DOG', 'BIRD', 'RABBIT', name='pettype'), nullable=True),
    sa.Column('level', sa.Integer(), nullable=True),
    sa.Column('health', sa.Float(), nullable=True),
    sa.Column('happiness', sa.Float(), nullable=True),
    sa.Column('energy', sa.Float(), nullable=True),
    sa.Column('last_interaction', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('owner_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pets_id'), 'pets', ['id'], unique=False)
    op.create_index(op.f('ix_pets_name'), 'pets', ['name'], unique=False)
    op.create_table('activity_registrations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('registration_time', sa.DateTime(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('activity_id', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['activity_id'], ['activities.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_registrations_id'), 'activity_registrations', ['id'], unique=False)
    op.create_table('pet_interactions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('interaction_type', sa.String(), nullable=True),
    sa.Column('timestamp', sa.DateTime(), nullable=True),
    sa.Column('health_change', sa.Float(), nullable=True),
    sa.Column('happiness_change', sa.Float(), nullable=True),
    sa.Column('energy_change', sa.Float(), nullable=True),
    sa.Column('pet_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['pet_id'], ['pets.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pet_interactions_id'), 'pet_interactions', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_pet_interactions_id'), table_name='pet_interactions')
    op.drop_table('pet_interactions')
    op.drop_index(op.f('ix_activity_registrations_id'), table_name='activity_registrations')
    op.drop_table('activity_registrations')
    op.drop_index(op.f('ix_pets_name'), table_name='pets')
    op.drop_index(op.f('ix_pets_id'), table_name='pets')
    op.drop_table('pets')
    op.drop_index(op.f('ix_guide_steps_id'), table_name='guide_steps')
    op.drop_table('guide_steps')
    op.drop_index(op.f('ix_activities_title'), table_name='activities')
    op.drop_index(op.f('ix_activities_id'), table_name='activities')
    op.drop_table('activities')
    op.drop_index(op.f('ix_users_phone'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_guides_title'), table_name='guides')
    op.drop_index(op.f('ix_guides_id'), table_name='guides')
    op.drop_table('guides')
    # ### end Alembic commands ###
